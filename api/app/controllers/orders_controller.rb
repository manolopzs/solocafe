class OrdersController < ApplicationController
  ORDER_INCLUDES = { order_items: [ :item, :order_item_modifiers ], pickup_slot: [], shop: [] }.freeze

  before_action :authenticate_user!, only: [ :index, :update, :recent, :usual ]
  before_action :require_shop_member!, only: [ :index, :update ]
  before_action :set_public_shop, only: [ :create, :show, :recent, :usual ]

  def recent
    orders = current_customer.orders
      .where(shop: Current.shop, payment_status: "succeeded")
      .where.not(status: "cancelled")
      .includes(ORDER_INCLUDES)
      .order(created_at: :desc)
      .limit(3)

    render json: { orders: serialize_orders(orders, audience: :guest) }
  end

  def usual
    result = UsualOrder.select(customer: current_customer, shop: Current.shop)
    render json: { usual_order: result ? usual_order_payload(result) : nil }
  end

  def show_public
    order = TenantScoped.unscoped_for_system { Order.includes(ORDER_INCLUDES).find_by(id: params[:id]) }
    return render json: { error: "Order not found" }, status: :not_found unless order

    if staff_for_order?(order)
      Current.shop = order.shop
      render json: { order: order_payload(order, audience: :staff) }
    elsif guest_token_matches?(order) || customer_owns_order?(order)
      Current.shop = order.shop
      render json: { order: order_payload(order, audience: :guest), push: push_config }
    else
      render json: { error: "Forbidden" }, status: :forbidden
    end
  end

  def index
    if params[:view] == "kitchen"
      render_kitchen
      return
    end

    orders = Current.shop.orders.includes(ORDER_INCLUDES).order(created_at: :desc)
    if params[:status].present?
      orders = orders.where(status: params[:status])
    else
      orders = orders.where.not(status: "pending_payment")
    end
    orders = orders.where(payment_status: %w[succeeded refunded]) unless params[:status] == "pending_payment"
    render json: { orders: serialize_orders(orders, audience: :staff) }
  end

  def show
    order = Current.shop.orders.includes(ORDER_INCLUDES).find(params[:id])

    if staff_for_current_shop?
      render json: { order: order_payload(order, audience: :staff) }
    elsif guest_token_matches?(order) || customer_owns_order?(order)
      render json: { order: order_payload(order, audience: :guest) }
    else
      render json: { error: "Forbidden" }, status: :forbidden
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Order not found" }, status: :not_found
  end

  def create
    return if performed?
    return unless ensure_shop_can_accept_order!

    items = validate_order_items
    return if items.nil?

    pickup_time, pickup_slot = validate_pickup_time_and_slot
    return if pickup_time.nil? && (order_params[:pickup_type] || "asap") == "scheduled"

    ActiveRecord::Base.transaction do
      customer = find_or_build_customer
      order = build_order(customer, items, pickup_time)

      unless order.save
        render json: { errors: order.errors.full_messages }, status: :unprocessable_entity
        raise ActiveRecord::Rollback
      end

      apply_loyalty_redemption!(order, customer, items)
      reserve_pickup_slot!(order, pickup_slot, pickup_time) if order.pickup_type_scheduled?
      saved = Current.shop.orders.includes(ORDER_INCLUDES).find(order.id)
      render json: { order: order_payload(saved, audience: :guest) }, status: :created
    rescue PickupSlot::CapacityExceeded
      render json: { errors: [ "Selected pickup slot is full" ] }, status: :unprocessable_entity
      raise ActiveRecord::Rollback
    end
  end

  def update
    order = Current.shop.orders.find(params[:id])
    new_status = params.dig(:order, :status)

    if new_status.blank?
      render json: { errors: [ "Status is required" ] }, status: :unprocessable_entity
      return
    end

    unless order.staff_can_transition_to?(new_status)
      render json: { errors: [ "Cannot transition from #{order.status} to #{new_status}" ] }, status: :unprocessable_entity
      return
    end

    old_status = order.status
    ActiveRecord::Base.transaction do
      order.update!(status: new_status)
      if new_status == "cancelled"
        order.release_slot!
        LoyaltyStamp.unwind!(order)
      end
      create_status_event(order, old_status, new_status)
      notify_customer_ready!(order) if new_status == "ready"
    end
    saved = Current.shop.orders.includes(ORDER_INCLUDES).find(order.id)
    render json: { order: order_payload(saved, audience: :staff) }
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

  def customer_owns_order?(order)
    current_user.present? && order.customer&.user_id == current_user.id
  end

  def ensure_shop_can_accept_order!
    reason = Current.shop.checkout_blocked_reason(order_params[:pickup_type].presence || "asap")
    return true if reason.nil?

    message = reason == "not_accepting" ? "Shop is not accepting pickup orders" : "Shop is closed"
    render json: { error: reason, errors: [ message ] }, status: :unprocessable_entity
    false
  end

  def validate_order_items
    checked = CartLineCheck.inspect_items(Current.shop, order_items_params)
    if checked.empty?
      render json: { error: "empty", errors: [ "Add at least one item" ] }, status: :unprocessable_entity
      return nil
    end

    blocked = checked.find { |line| !line[:available] }
    if blocked
      code = blocked[:unavailable_reason] == "modifier_unavailable" ? "modifier_unavailable" : "item_unavailable"
      message = code == "modifier_unavailable" ? "Modifier does not belong to item" : "Menu item is not available"
      render json: { error: code, errors: [ message ] }, status: :unprocessable_entity
      return nil
    end

    checked
  end

  def find_or_build_customer
    return nil unless current_user

    customer = Customer.find_or_initialize_by(user_id: current_user.id)
    if customer.name.blank? && order_params[:customer_name].present?
      customer.name = order_params[:customer_name]
    end
    customer.save!
    customer
  end

  def build_order(customer, items, pickup_time)
    quote = OrderPricing.quote(Current.shop, items)
    order = Current.shop.orders.build(
      customer: customer,
      status: "pending_payment",
      payment_status: "pending",
      currency: Current.shop.currency,
      pickup_type: order_params[:pickup_type] || "asap",
      pickup_time: pickup_time,
      customer_name: order_params[:customer_name],
      customer_phone: order_params[:customer_phone],
      customer_email: order_params[:customer_email],
      special_instructions: order_params[:special_instructions]
    )

    items.each_with_index do |data, index|
      priced = quote[:lines][index]
      menu_item = data[:menu_item]
      order_item = order.order_items.build(
        item: menu_item,
        item_name_snapshot: menu_item.name,
        unit_price_cents: priced.unit_price_cents,
        quantity: data[:quantity],
        subtotal_cents: priced.subtotal_cents
      )

      data[:modifiers].each do |option|
        order_item.order_item_modifiers.build(
          option: option,
          option_name_snapshot: option.name,
          price_cents: option.price_cents
        )
      end
    end

    order.subtotal_cents = quote[:subtotal_cents]
    order.tax_cents = quote[:tax_cents]
    order.total_cents = quote[:total_cents]
    order
  end

  def validate_pickup_time_and_slot
    return [ nil, nil ] if order_params[:pickup_type] != "scheduled"

    date_string = order_params[:pickup_slot_date]
    time_string = order_params[:pickup_slot_start_time]

    if date_string.blank? || time_string.blank?
      render json: { errors: [ "Pickup date and time are required for scheduled orders" ] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    begin
      slot_date = Date.parse(date_string)
    rescue ArgumentError
      render json: { errors: [ "Invalid pickup date" ] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    pickup_time = nil
    begin
      Time.use_zone(Current.shop.timezone) do
        hour, min = time_string.split(":").map(&:to_i)
        pickup_time = Time.zone.local(slot_date.year, slot_date.month, slot_date.day, hour, min)
      end
    rescue ArgumentError
      render json: { errors: [ "Invalid pickup time" ] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    unless Current.shop.open_at?(pickup_time)
      render json: { errors: [ "Selected time is outside operating hours" ] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    min_time = Time.zone.now + Current.shop.prep_time_buffer_minutes.minutes
    if pickup_time < min_time
      render json: { errors: [ "Pickup time must be at least #{Current.shop.prep_time_buffer_minutes} minutes from now" ] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    slot = Current.shop.pickup_slots.find_by(slot_date: slot_date, start_time: pickup_time)
    if slot && SlotReservation.where(slot_id: slot.id).count >= slot.capacity
      render json: { errors: [ "Selected pickup slot is full" ] }, status: :unprocessable_entity
      return [ nil, nil ]
    end

    [ pickup_time, slot ]
  end

  def apply_loyalty_redemption!(order, customer, items)
    return unless ActiveModel::Type::Boolean.new.cast(order_params[:redeem_loyalty])

    if customer.nil?
      render json: { error: "loyalty_unavailable" }, status: :unprocessable_entity
      raise ActiveRecord::Rollback
    end

    quote = OrderPricing.quote(Current.shop, items)
    LoyaltyStamp.redeem!(order, customer, quote[:lines])
  rescue LoyaltyStamp::Unavailable
    render json: { error: "loyalty_unavailable" }, status: :unprocessable_entity
    raise ActiveRecord::Rollback
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

  def render_kitchen
    since = parsed_since
    return if performed?

    server_time = Time.current
    orders = Current.shop.orders.kitchen.includes(ORDER_INCLUDES).order(created_at: :asc).to_a

    render json: {
      orders: serialize_orders(orders, audience: :staff),
      sync: KdsSync.snapshot(server_time),
      alerts: kitchen_alerts(since, server_time, orders.map(&:id))
    }
  end

  def parsed_since
    return nil if params[:since].blank?

    parsed = Time.zone.parse(params[:since].to_s)
    if parsed.nil?
      render json: { errors: [ "since is not a valid time" ] }, status: :unprocessable_entity
      return nil
    end

    parsed
  rescue ArgumentError
    render json: { errors: [ "since is not a valid time" ] }, status: :unprocessable_entity
    nil
  end

  def kitchen_alerts(since, server_time, order_ids)
    return [] if since.nil? || order_ids.empty?

    Current.shop.events
      .where(event_type: "order.kitchen_new", order_id: order_ids)
      .where("created_at > ? AND created_at <= ?", since, server_time)
      .order(:created_at)
      .map do |event|
        {
          order_id: event.order_id,
          event_type: event.event_type,
          created_at: event.created_at.iso8601(6)
        }
      end
  end

  def create_status_event(order, from_status, to_status)
    Current.shop.events.create!(
      order: order,
      event_type: "order.status_changed",
      payload: { from: from_status, to: to_status }
    )
  end

  def push_config
    { vapid_public_key: ENV["VAPID_PUBLIC_KEY"].presence }
  end

  def notify_customer_ready!(order)
    has_push = Current.shop.push_devices.where(audience: "customer", order_id: order.id).exists?
    channel = if has_push
      "web_push"
    elsif order.customer_phone.present?
      "sms"
    else
      "in_app"
    end

    Current.shop.notifications.create!(
      order: order,
      notification_type: "order.ready",
      channel: channel,
      status: has_push ? "queued" : "pending"
    )
    CustomerReadyPush.enqueue(order)
  end

  def order_params
    params.require(:order).permit(
      :customer_name, :customer_phone, :customer_email, :special_instructions,
      :pickup_type, :pickup_slot_date, :pickup_slot_start_time, :redeem_loyalty
    )
  end

  def order_items_params
    params.require(:order).require(:items).map do |item|
      item.permit(:menu_item_id, :quantity, modifier_option_ids: [])
    end
  end

  def serialize_orders(orders, audience:)
    records = orders.to_a
    active_ids = PickupEstimate.active_order_ids(Current.shop)
    records.map { |order| order_payload(order, audience: audience, active_ids: active_ids) }
  end

  def order_payload(order, audience:, active_ids: nil)
    shop = shop_for(order)
    active_ids ||= PickupEstimate.active_order_ids(shop)
    queue_count = PickupEstimate.queue_count_for(active_ids, order.id)
    minutes = PickupEstimate.minutes_for(
      shop: shop,
      lines: PickupEstimate.lines_for(order),
      queue_count: queue_count
    )
    window = PickupEstimate.window_for(
      shop: shop,
      minutes: minutes,
      pickup_type: order.pickup_type,
      pickup_time: order.pickup_time,
      pickup_slot: order.pickup_slot
    )

    payload = {
      id: order.id,
      shop_id: order.shop_id,
      customer_id: order.customer_id,
      status: order.status,
      payment_status: order.payment_status,
      subtotal_cents: order.subtotal_cents,
      discount_cents: order.discount_cents,
      loyalty_redeemed: order.loyalty_redeemed,
      tax_cents: order.tax_cents,
      tip_cents: order.tip_cents,
      total_cents: order.total_cents,
      currency: order.currency,
      pickup_type: order.pickup_type,
      pickup_time: order.pickup_time,
      pickup_slot: order.pickup_slot ? pickup_slot_payload(order.pickup_slot) : nil,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      special_instructions: order.special_instructions,
      estimated_ready_minutes: minutes,
      pickup_window_starts_at: window[:starts_at]&.iso8601,
      pickup_window_ends_at: window[:ends_at]&.iso8601,
      item_count: order.order_items.sum { |order_item| order_item.quantity },
      shop: shop_snippet(shop),
      allowed_transitions: order.allowed_transitions,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.order_items.map { |order_item| order_item_payload(order_item) },
      loyalty: order.customer ? LoyaltyStamp.progress_for(order.customer, shop) : nil
    }

    if audience == :staff
      payload[:customer_phone] = order.customer_phone
    else
      payload[:access_token] = order.guest_access_token
    end

    payload
  end

  def shop_for(order)
    Current.shop&.id == order.shop_id ? Current.shop : order.shop
  end

  def shop_snippet(shop)
    {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      address: shop.address,
      lat: shop.lat&.to_f,
      lng: shop.lng&.to_f,
      timezone: shop.timezone,
      directions_url: shop.directions_url
    }
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

  def usual_order_payload(result)
    order = result.order
    lines = order.order_items.map { |order_item| usual_line_payload(order_item) }
    {
      source_order_id: order.id,
      times_ordered: result.times_ordered,
      label: lines.map { |line| line[:label] }.join(", "),
      can_reorder: lines.any? { |line| line[:available] },
      items: lines
    }
  end

  def usual_line_payload(order_item)
    checked = CartLineCheck.inspect_item(
      Current.shop,
      {
        menu_item_id: order_item.item_id,
        quantity: order_item.quantity,
        modifier_option_ids: order_item.order_item_modifiers.map(&:option_id)
      }
    )
    modifier_names = order_item.order_item_modifiers.map(&:option_name_snapshot)
    {
      menu_item_id: order_item.item_id,
      name: order_item.item_name_snapshot,
      image_url: checked[:image_url],
      quantity: order_item.quantity,
      modifier_option_ids: checked[:modifier_option_ids],
      modifier_names: modifier_names,
      label: item_label(order_item.item_name_snapshot, modifier_names),
      available: checked[:available],
      unavailable_reason: checked[:unavailable_reason]
    }
  end

  def item_label(name, modifier_names)
    return name if modifier_names.empty?

    joiner = Current.shop.locale == "en" ? "with" : "con"
    "#{name} #{joiner} #{modifier_names.join(", ")}"
  end
end
