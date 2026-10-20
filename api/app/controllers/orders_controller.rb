class OrdersController < ApplicationController
  before_action :authenticate_user!, only: [:index, :update, :recent]
  before_action :require_shop_member!, only: [:index, :update]
  before_action :set_public_shop, only: [:create, :show, :recent]

  def recent
    orders = current_customer.orders
      .where(shop: Current.shop, payment_status: "succeeded")
      .where.not(status: "cancelled")
      .order(created_at: :desc)
      .limit(3)

    render json: { orders: orders.map { |order| order_payload(order) } }
  end

  def show_public
    order = Order.find(params[:id])

    if staff_for_order?(order)
      render json: { order: order_payload(order) }
    elsif order.customer_phone.present? && order.customer_phone == params[:customer_phone]
      render json: { order: order_payload(order) }
    else
      render json: { error: "Forbidden" }, status: :forbidden
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Order not found" }, status: :not_found
  end

  def index
    orders = Current.shop.orders.order(created_at: :desc)
    if params[:status].present?
      orders = orders.where(status: params[:status])
    else
      orders = orders.where.not(status: "pending_payment")
    end
    orders = orders.where(payment_status: %w[succeeded refunded]) unless params[:status] == "pending_payment"
    render json: { orders: orders.map { |order| order_payload(order) } }
  end

  def show
    order = Current.shop.orders.find(params[:id])

    if staff_for_current_shop?
      render json: { order: order_payload(order) }
    elsif order.customer_phone.present? && order.customer_phone == params[:customer_phone]
      render json: { order: order_payload(order) }
    else
      render json: { error: "Forbidden" }, status: :forbidden
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Order not found" }, status: :not_found
  end

  def create
    return if performed?

    items = validate_order_items
    return if items.nil?

    pickup_time, pickup_slot = validate_pickup_time_and_slot
    return if pickup_time.nil? && order_params[:pickup_type] == "scheduled"

    ActiveRecord::Base.transaction do
      customer = find_or_build_customer
      order = build_order(customer, items, pickup_time)

      unless order.save
        render json: { errors: order.errors.full_messages }, status: :unprocessable_entity
        raise ActiveRecord::Rollback
      end

      reserve_pickup_slot!(order, pickup_slot, pickup_time) if order.pickup_type_scheduled?
      render json: { order: order_payload(order.reload) }, status: :created
    rescue PickupSlot::CapacityExceeded
      render json: { errors: [ "Selected pickup slot is full" ] }, status: :unprocessable_entity
      raise ActiveRecord::Rollback
    end
  end

  def update
    order = Current.shop.orders.find(params[:id])
    new_status = params.dig(:order, :status)

    if new_status.blank?
      render json: { errors: ["Status is required"] }, status: :unprocessable_entity
      return
    end

    unless order.staff_can_transition_to?(new_status)
      render json: { errors: ["Cannot transition from #{order.status} to #{new_status}"] }, status: :unprocessable_entity
      return
    end

    old_status = order.status
    ActiveRecord::Base.transaction do
      order.update!(status: new_status)
      order.release_slot! if new_status == "cancelled"
      create_status_event(order, old_status, new_status)
      create_ready_notification(order) if new_status == "ready"
    end
    render json: { order: order_payload(order) }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Order not found" }, status: :not_found
  end

  private

  def set_public_shop
    shop = Shop.active.find_by(id: params[:shop_id])
    if shop.nil?
      render json: { error: "Shop not found" }, status: :not_found
      return
    end

    Current.shop = shop
  end

  def staff_for_current_shop?
    current_user.present? && Current.shop.shop_members.exists?(user_id: current_user.id)
  end

  def staff_for_order?(order)
    current_user.present? && order.shop.shop_members.exists?(user_id: current_user.id)
  end

  def validate_order_items
    items = []

    order_items_params.each do |item_data|
      menu_item = Current.shop.menu_items.find_by(id: item_data[:menu_item_id], is_active: true, is_86ed: false)
      unless menu_item
        render json: { errors: ["Menu item is not available"] }, status: :unprocessable_entity
        return nil
      end

      quantity = item_data[:quantity].to_i
      if quantity < 1
        render json: { errors: ["Quantity must be at least 1"] }, status: :unprocessable_entity
        return nil
      end

      modifier_ids = Array(item_data[:modifier_option_ids]).map(&:to_s).reject(&:blank?)
      invalid_modifier_id = modifier_ids.find do |moid|
        !menu_item.modifier_groups.joins(:modifier_options).exists?(modifier_options: { id: moid })
      end

      if invalid_modifier_id
        render json: { errors: ["Modifier does not belong to item"] }, status: :unprocessable_entity
        return nil
      end

      modifiers = ModifierOption.where(id: modifier_ids).to_a
      items << { menu_item: menu_item, quantity: quantity, modifiers: modifiers }
    end

    items
  end

  def find_or_build_customer
    phone = order_params[:customer_phone]
    name = order_params[:customer_name]

    if current_user.present?
      customer = Customer.find_or_initialize_by(user_id: current_user.id)
      customer.phone = phone if phone.present?
      customer.name = name if name.present?
      customer.save!
      return customer
    end

    return nil if phone.blank?

    customer = Customer.find_or_initialize_by(phone: phone, user_id: nil)
    customer.name = name if name.present?
    customer.save!
    customer
  end

  def build_order(customer, items, pickup_time)
    order = Current.shop.orders.build(
      customer: customer,
      status: "pending_payment",
      payment_status: "pending",
      currency: Current.shop.currency,
      pickup_type: order_params[:pickup_type] || "asap",
      pickup_time: pickup_time,
      customer_name: order_params[:customer_name],
      customer_phone: order_params[:customer_phone],
      special_instructions: order_params[:special_instructions]
    )

    subtotal_cents = 0

    items.each do |data|
      menu_item = data[:menu_item]
      modifiers = data[:modifiers]
      quantity = data[:quantity]

      modifiers_total_cents = modifiers.sum(&:price_cents)
      unit_price_cents = menu_item.price_cents + modifiers_total_cents
      line_subtotal_cents = unit_price_cents * quantity

      order_item = order.order_items.build(
        item: menu_item,
        item_name_snapshot: menu_item.name,
        unit_price_cents: unit_price_cents,
        quantity: quantity,
        subtotal_cents: line_subtotal_cents
      )

      modifiers.each do |option|
        order_item.order_item_modifiers.build(
          option: option,
          option_name_snapshot: option.name,
          price_cents: option.price_cents
        )
      end

      subtotal_cents += line_subtotal_cents
    end

    tax_cents = (subtotal_cents * Current.shop.tax_rate).round
    total_cents = Current.shop.tax_included ? subtotal_cents : subtotal_cents + tax_cents

    order.subtotal_cents = subtotal_cents
    order.tax_cents = tax_cents
    order.total_cents = total_cents

    order
  end

  def validate_pickup_time_and_slot
    return [ nil, nil ] if order_params[:pickup_type] != "scheduled"

    date_string = order_params[:pickup_slot_date]
    time_string = order_params[:pickup_slot_start_time]

    if date_string.blank? || time_string.blank?
      render json: { errors: ["Pickup date and time are required for scheduled orders"] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    begin
      slot_date = Date.parse(date_string)
    rescue ArgumentError
      render json: { errors: ["Invalid pickup date"] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    pickup_time = nil
    begin
      Time.use_zone(Current.shop.timezone) do
        hour, min = time_string.split(":").map(&:to_i)
        pickup_time = Time.zone.local(slot_date.year, slot_date.month, slot_date.day, hour, min)
      end
    rescue ArgumentError
      render json: { errors: ["Invalid pickup time"] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    unless Current.shop.open_at?(pickup_time)
      render json: { errors: ["Selected time is outside operating hours"] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    min_time = Time.zone.now + Current.shop.prep_time_buffer_minutes.minutes
    if pickup_time < min_time
      render json: { errors: ["Pickup time must be at least #{Current.shop.prep_time_buffer_minutes} minutes from now"] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    slot = Current.shop.pickup_slots.find_by(slot_date: slot_date, start_time: pickup_time)
    if slot && SlotReservation.where(slot_id: slot.id).count >= slot.capacity
      render json: { errors: ["Selected pickup slot is full"] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    [ pickup_time, slot ]
  end

  def reserve_pickup_slot!(order, existing_slot, pickup_time)
    local_time = pickup_time.in_time_zone(Current.shop.timezone)
    PickupSlot.reserve_for!(
      shop: Current.shop,
      slot_date: existing_slot&.slot_date || local_time.to_date,
      start_time: existing_slot&.start_time || local_time.strftime("%H:%M:%S"),
      end_time: existing_slot&.end_time || (local_time + Current.shop.slot_duration_minutes.minutes).strftime("%H:%M:%S"),
      order: order,
      pickup_time: pickup_time
    )
  end

  def create_status_event(order, from_status, to_status)
    Current.shop.events.create!(
      order: order,
      event_type: "order.status_changed",
      payload: { from: from_status, to: to_status }
    )
  end

  def create_ready_notification(order)
    return if order.customer_phone.blank?

    Current.shop.notifications.create!(
      order: order,
      notification_type: "order.ready",
      channel: "sms",
      status: "pending"
    )
  end

  def order_params
    params.require(:order).permit(
      :customer_name, :customer_phone, :special_instructions,
      :pickup_type, :pickup_slot_date, :pickup_slot_start_time
    )
  end

  def order_items_params
    params.require(:order).require(:items).map do |item|
      item.permit(:menu_item_id, :quantity, modifier_option_ids: [])
    end
  end

  def order_payload(order)
    {
      id: order.id,
      shop_id: order.shop_id,
      customer_id: order.customer_id,
      status: order.status,
      payment_status: order.payment_status,
      subtotal_cents: order.subtotal_cents,
      tax_cents: order.tax_cents,
      tip_cents: order.tip_cents,
      total_cents: order.total_cents,
      currency: order.currency,
      pickup_type: order.pickup_type,
      pickup_time: order.pickup_time,
      pickup_slot: order.pickup_slot ? pickup_slot_payload(order.pickup_slot) : nil,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      special_instructions: order.special_instructions,
      estimated_ready_minutes: estimated_ready_minutes(order.shop),
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.order_items.map { |order_item| order_item_payload(order_item) }
    }
  end

  def estimated_ready_minutes(shop)
    active_orders_count = shop.orders.where(status: %w[received preparing]).count
    base_minutes = shop.prep_time_buffer_minutes + shop.menu_items.where(is_active: true, is_86ed: false).minimum(:prep_time_min).to_i
    [base_minutes + active_orders_count, 60].min
  end

  def pickup_slot_payload(slot)
    {
      id: slot.id,
      slot_date: slot.slot_date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      capacity: slot.capacity
    }
  end

  def order_item_payload(order_item)
    {
      id: order_item.id,
      item_id: order_item.item_id,
      item_name_snapshot: order_item.item_name_snapshot,
      unit_price_cents: order_item.unit_price_cents,
      quantity: order_item.quantity,
      subtotal_cents: order_item.subtotal_cents,
      modifiers: order_item.order_item_modifiers.map { |modifier| order_item_modifier_payload(modifier) }
    }
  end

  def order_item_modifier_payload(modifier)
    {
      id: modifier.id,
      option_id: modifier.option_id,
      option_name_snapshot: modifier.option_name_snapshot,
      price_cents: modifier.price_cents
    }
  end
end
