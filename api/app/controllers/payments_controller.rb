class PaymentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_order_and_authorize!

  def create
    if Current.shop.stripe_account_id.blank?
      render json: { error: "Shop is not connected to Stripe" }, status: :unprocessable_entity
      return
    end

    payment_intent = create_or_update_payment_intent
    find_or_create_payment!(payment_intent)

    render json: { client_secret: payment_intent.client_secret }
  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :bad_gateway
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  end

  private

  def set_order_and_authorize!
    set_current_shop!
    return if performed?

    if order_id.blank?
      render json: { error: "order_id is required" }, status: :bad_request
      return
    end

    @order = Order.find_by(id: order_id)
    if @order.nil?
      render json: { error: "Order not found" }, status: :not_found
      return
    end

    unless staff? || order_owner?(@order)
      render json: { error: "Forbidden" }, status: :forbidden
    end
  end

  def order_id
    payment_params[:order_id]
  end

  def payment_params
    params.permit(:order_id)
  end

  def staff?
    Current.shop.shop_members.exists?(user_id: Current.user.id)
  end

  def order_owner?(order)
    order.customer&.user_id == Current.user.id
  end

  def create_or_update_payment_intent
    existing_payment_intent_id = @order.payment&.stripe_payment_intent_id

    if existing_payment_intent_id.present?
      Stripe::PaymentIntent.update(
        existing_payment_intent_id,
        {
          amount: @order.total_cents,
          currency: @order.currency.downcase,
          application_fee_amount: application_fee_amount,
          metadata: { order_id: @order.id, shop_id: Current.shop.id }
        }
      )
    else
      Stripe::PaymentIntent.create(
        amount: @order.total_cents,
        currency: @order.currency.downcase,
        automatic_payment_methods: { enabled: true },
        application_fee_amount: application_fee_amount,
        transfer_data: { destination: Current.shop.stripe_account_id },
        on_behalf_of: Current.shop.stripe_account_id,
        metadata: { order_id: @order.id, shop_id: Current.shop.id }
      )
    end
  end

  def find_or_create_payment!(payment_intent)
    Payment.find_or_initialize_by(order: @order).tap do |payment|
      payment.assign_attributes(
        stripe_payment_intent_id: payment_intent.id,
        amount_cents: @order.total_cents,
        currency: @order.currency,
        platform_fee_cents: application_fee_amount,
        status: map_stripe_status(payment_intent.status)
      )
      payment.save!
    end
  end

  def application_fee_amount
    percent = ENV.fetch("PLATFORM_FEE_PERCENT", "0").to_f
    (@order.total_cents * percent / 100.0).round
  end

  def map_stripe_status(stripe_status)
    case stripe_status
    when "succeeded" then "succeeded"
    when "canceled" then "failed"
    else "pending"
    end
  end
end
