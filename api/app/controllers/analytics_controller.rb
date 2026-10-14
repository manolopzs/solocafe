class AnalyticsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!

  def summary
    days = params[:days].to_i
    days = 30 if days <= 0

    orders = Current.shop.orders
    orders = orders.where("created_at >= ?", days.days.ago) if params[:days] != "all"

    paid_orders = orders.where(payment_status: "succeeded")

    order_count = paid_orders.count
    revenue_cents = paid_orders.sum(:total_cents)
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
    orders
      .group("EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC' AT TIME ZONE ?)", Current.shop.timezone)
      .count
      .transform_keys(&:to_i)
      .sort_by { |hour, count| -count }
      .first(5)
      .to_h
  end

  def top_items(orders)
    order_ids = orders.select(:id)
    OrderItem
      .where(order_id: order_ids)
      .group(:item_name_snapshot)
      .select("item_name_snapshot, SUM(quantity) as total_quantity, SUM(subtotal_cents) as total_revenue_cents")
      .order("SUM(quantity) DESC")
      .limit(5)
      .map do |item|
        {
          name: item.item_name_snapshot,
          quantity: item.total_quantity.to_i,
          revenue_cents: item.total_revenue_cents.to_i
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
