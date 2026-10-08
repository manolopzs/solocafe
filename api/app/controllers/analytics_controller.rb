class AnalyticsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!

  def summary
    orders = Current.shop.orders.where(payment_status: "succeeded")

    order_count = orders.count
    revenue_cents = orders.sum(:total_cents)
    average_ticket_cents = order_count.positive? ? (revenue_cents / order_count) : 0

    render json: {
      order_count: order_count,
      revenue_cents: revenue_cents,
      average_ticket_cents: average_ticket_cents
    }
  end
end
