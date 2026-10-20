class CustomersController < ApplicationController
  before_action :authenticate_user!

  def me
    render json: { customer: customer_payload(current_customer) }
  end

  def update
    customer = current_customer
    if customer.update(customer_params)
      render json: { customer: customer_payload(customer) }
    else
      render json: { errors: customer.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def orders
    customer = current_customer
    orders = TenantScoped.unscoped_for_system do
      Order.where(customer: customer).order(created_at: :desc).limit(50).to_a
    end
    render json: { orders: orders.map { |order| order_payload(order) } }
  end

  def order
    customer = current_customer
    order = TenantScoped.unscoped_for_system { Order.where(customer: customer).find(params[:id]) }
    render json: { order: order_payload(order) }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Order not found" }, status: :not_found
  end

  private

  def current_customer
    return @current_customer if defined?(@current_customer)

    @current_customer = Customer.find_or_initialize_by(user_id: Current.user.id)
    @current_customer.name ||= Current.user.email.split("@").first if @current_customer.new_record?
    @current_customer.save! if @current_customer.new_record?
    @current_customer
  end

  def customer_params
    params.require(:customer).permit(:name, :phone)
  end

  def customer_payload(customer)
    {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      user_id: customer.user_id,
      created_at: customer.created_at,
      updated_at: customer.updated_at
    }
  end

  def order_payload(order)
    {
      id: order.id,
      shop_id: order.shop_id,
      shop_name: order.shop.name,
      shop_slug: order.shop.slug,
      status: order.status,
      payment_status: order.payment_status,
      subtotal_cents: order.subtotal_cents,
      tax_cents: order.tax_cents,
      tip_cents: order.tip_cents,
      total_cents: order.total_cents,
      currency: order.currency,
      pickup_type: order.pickup_type,
      pickup_time: order.pickup_time,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      special_instructions: order.special_instructions,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.order_items.map { |item| order_item_payload(item) }
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
