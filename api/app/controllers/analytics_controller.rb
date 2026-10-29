class AnalyticsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!

  def summary
    days = params[:days].to_i
    days = 30 if days <= 0

    orders = Current.shop.orders
    orders = orders.where("created_at >= ?", days.days.ago) if params[:days] != "all"

    order_count = orders.count
    revenue_cents = orders.sum(:total_cents)
    average_ticket_cents = order_count.positive? ? (revenue_cents / order_count) : 0

    render json: {
      order_count: order_count,
      revenue_cents: revenue_cents,
      average_ticket_cents: average_ticket_cents,
      peak_hours: peak_hours(orders),
      top_items: top_items(orders),
      repeat_customer_rate: repeat_customer_rate(orders)
    }
  end

  private

  def peak_hours(orders)
    return [] if orders.none?

    timezone = Current.shop.timezone
    counts = Hash.new(0)
    orders.find_each do |order|
      counts[order.created_at.in_time_zone(timezone).hour] += 1
    end

    counts
      .sort_by { |_, count| -count }
      .first(5)
      .map { |hour, count| { hour: hour, count: count } }
  end

  def top_items(orders)
    return [] if orders.none?

    order_ids = orders.pluck(:id)
    return [] if order_ids.empty?

    quantities = OrderItem.where(order_id: order_ids).group(:item_name_snapshot).sum(:quantity)
    revenues = OrderItem.where(order_id: order_ids).group(:item_name_snapshot).sum(:subtotal_cents)

    quantities
      .sort_by { |_, quantity| -quantity }
      .first(5)
      .map do |name, quantity|
        {
          name: name,
          quantity: quantity,
          revenue_cents: revenues[name].to_i
        }
      end
  end

  def repeat_customer_rate(orders)
    customer_counts = orders.where.not(customer_id: nil).group(:customer_id).count
    return 0 if customer_counts.empty?

    repeat_customers = customer_counts.values.count { |count| count > 1 }
    (repeat_customers.to_f / customer_counts.size * 100).round
  end
end
