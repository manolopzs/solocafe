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
    return [] if orders.count.zero?

    order_ids = orders.pluck(:id)
    timezone = ActiveRecord::Base.connection.quote(Current.shop.timezone)

    sql = <<~SQL
      SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC' AT TIME ZONE #{timezone}) AS hour,
             COUNT(*) AS order_count
      FROM orders
      WHERE id IN (#{order_ids.map { |id| ActiveRecord::Base.connection.quote(id) }.join(', ')})
      GROUP BY hour
      ORDER BY order_count DESC
      LIMIT 5
    SQL

    ActiveRecord::Base.connection.select_all(sql).map do |row|
      { hour: row["hour"].to_i, count: row["order_count"].to_i }
    end
  end

  def top_items(orders)
    return [] if orders.count.zero?

    order_ids = orders.pluck(:id)

    sql = <<~SQL
      SELECT item_name_snapshot AS name,
             SUM(quantity) AS total_quantity,
             SUM(subtotal_cents) AS total_revenue_cents
      FROM order_items
      WHERE order_id IN (#{order_ids.map { |id| ActiveRecord::Base.connection.quote(id) }.join(', ')})
      GROUP BY item_name_snapshot
      ORDER BY total_quantity DESC
      LIMIT 5
    SQL

    ActiveRecord::Base.connection.select_all(sql).map do |row|
      {
        name: row["name"],
        quantity: row["total_quantity"].to_i,
        revenue_cents: row["total_revenue_cents"].to_i
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
