class PaymentsController < ApplicationController
  before_action :set_order!
  before_action :authorize_payer!
  before_action :ensure_payable!, except: :sync

  def create
    return if performed?

    if Current.shop.stripe_account_id.blank?
      render json: { error: "Shop is not connected to Stripe" }, status: :unprocessable_entity
      return
    end

    if params[:payment_method_id].present?
      charge_saved_card
      return
    end

    payment_intent = create_or_update_payment_intent
    find_or_create_payment!(payment_intent)

    render json: { client_secret: payment_intent.client_secret }
  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :bad_gateway
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [ e.message ] }, status: :unprocessable_entity
  end

  def sync
    return if performed?

    payment = @order.payment
    if payment.nil? || payment.stripe_payment_intent_id.blank?
      render json: { status: "pending" }
      return
    end

    options = {}
    options[:stripe_account] = payment.stripe_account_id if payment.stripe_account_id.present?
    intent = Stripe::PaymentIntent.retrieve(payment.stripe_payment_intent_id, options)
    apply_intent_status!(payment, intent)

    render json: {
      status: client_status(intent.status),
      client_secret: intent.client_secret,
      stripe_account_id: payment.stripe_account_id
    }
  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :bad_gateway
  end

  private

  def set_order!
    if order_id.blank?
      render json: { error: "order_id is required" }, status: :bad_request
      return
    end

    @order = Order.across_shops.find_by(id: order_id)
    if @order.nil?
      render json: { error: "Order not found" }, status: :not_found
      return
    end

    Current.shop = @order.shop
  end

  def authorize_payer!
    return if performed?
    return if payer_owns_order?

    render json: { error: "Unauthorized" }, status: :unauthorized
  end

  def ensure_payable!
    return if performed?

    if @order.payment&.status_succeeded? || @order.payment_status_succeeded? || @order.payment_status_refunded?
      render json: { error: "Order is already paid" }, status: :unprocessable_entity
      return
    end

    return if @order.status_pending_payment?

    render json: { error: "Order cannot accept payment" }, status: :unprocessable_entity
  end

  def payer_owns_order?
    if current_user.present? && @order.customer&.user_id == current_user.id
      return true
    end

    guest_token_matches?(@order)
  end

  def order_id
    payment_params[:order_id]
  end

  def payment_params
    params.permit(:order_id, :token, :save_card, :payment_method_id, :return_url)
  end

  def order_owner
    return nil unless current_user

    customer = @order.customer
    return nil unless customer&.user_id == current_user.id

    customer
  end

  def save_card_requested?
    ActiveModel::Type::Boolean.new.cast(params[:save_card]) && order_owner.present?
  end

  def create_or_update_payment_intent
    save_card = save_card_requested?
    stripe_customer_id = order_owner.ensure_platform_stripe_customer! if save_card
    existing_payment_intent_id = @order.payment&.stripe_payment_intent_id
    attributes = {
      amount: @order.total_cents,
      currency: @order.currency.downcase,
      application_fee_amount: application_fee_amount,
      metadata: payment_metadata(save_card)
    }

    if save_card
      attributes[:customer] = stripe_customer_id
      attributes[:setup_future_usage] = "off_session"
    end

    if existing_payment_intent_id.present?
      Stripe::PaymentIntent.update(existing_payment_intent_id, attributes)
    else
      Stripe::PaymentIntent.create(
        attributes.merge(
          automatic_payment_methods: { enabled: true },
          transfer_data: { destination: Current.shop.stripe_account_id },
          on_behalf_of: Current.shop.stripe_account_id
        )
      )
    end
  end

  def payment_metadata(save_card)
    metadata = { order_id: @order.id, shop_id: Current.shop.id }
    if save_card
      metadata[:save_card] = "true"
      metadata[:customer_id] = @order.customer_id
    elsif params.key?(:save_card) && order_owner.present?
      metadata[:save_card] = "false"
    end
    metadata
  end

  def charge_saved_card
    owner = order_owner
    unless owner
      render json: { error: "Unauthorized" }, status: :unauthorized
      return
    end

    unless valid_return_url?(params[:return_url])
      render json: { error: "return_url is required" }, status: :bad_request
      return
    end

    payment_method = CustomerPaymentMethod.for_customer(owner).find_by(id: params[:payment_method_id])
    if payment_method.nil?
      render json: { error: "Payment method not found" }, status: :not_found
      return
    end

    if owner.stripe_customer_id.blank?
      render json: { error: "Customer has no saved cards" }, status: :unprocessable_entity
      return
    end

    existing = @order.payment
    if reusable_direct_charge?(existing)
      intent = Stripe::PaymentIntent.retrieve(
        existing.stripe_payment_intent_id,
        { stripe_account: existing.stripe_account_id }
      )
      if %w[succeeded requires_action processing requires_confirmation].include?(intent.status)
        apply_intent_status!(existing, intent)
        render json: saved_card_payload(intent, existing.stripe_account_id)
        return
      end
    end

    cancel_platform_intent!(existing)
    cloned = Stripe::PaymentMethod.create(
      {
        customer: owner.stripe_customer_id,
        payment_method: payment_method.stripe_payment_method_id
      },
      { stripe_account: Current.shop.stripe_account_id }
    )
    intent = Stripe::PaymentIntent.create(
      {
        amount: @order.total_cents,
        currency: @order.currency.downcase,
        payment_method: cloned.id,
        payment_method_types: [ "card" ],
        confirm: true,
        application_fee_amount: application_fee_amount,
        return_url: params[:return_url],
        metadata: {
          order_id: @order.id,
          shop_id: Current.shop.id,
          customer_id: owner.id,
          save_card: "false"
        }
      },
      { stripe_account: Current.shop.stripe_account_id }
    )
    payment = find_or_create_payment!(intent, stripe_account_id: Current.shop.stripe_account_id)
    apply_intent_status!(payment, intent)
    render json: saved_card_payload(intent, Current.shop.stripe_account_id)
  end

  def reusable_direct_charge?(payment)
    payment&.stripe_account_id.present? && payment.stripe_payment_intent_id.present? && !payment.status_succeeded?
  end

  def cancel_platform_intent!(payment)
    return if payment.nil?
    return if payment.stripe_account_id.present?
    return if payment.stripe_payment_intent_id.blank?
    return unless payment.status_pending?

    Stripe::PaymentIntent.cancel(payment.stripe_payment_intent_id)
  rescue Stripe::StripeError
    nil
  end

  def apply_intent_status!(payment, intent)
    case intent.status
    when "succeeded"
      payment.update!(status: "succeeded", stripe_payment_intent_id: intent.id)
      @order.apply_successful_payment! unless @order.payment_status_succeeded?
    when "canceled"
      payment.update!(status: "failed", stripe_payment_intent_id: intent.id) unless payment.status_succeeded?
    else
      payment.update!(status: "pending", stripe_payment_intent_id: intent.id) unless payment.status_succeeded?
    end
  end

  def saved_card_payload(intent, stripe_account_id)
    {
      status: client_status(intent.status),
      client_secret: intent.client_secret,
      stripe_account_id: stripe_account_id
    }
  end

  def client_status(stripe_status)
    case stripe_status
    when "succeeded" then "succeeded"
    when "requires_action", "requires_confirmation" then "requires_action"
    when "canceled", "requires_payment_method" then "failed"
    else "pending"
    end
  end

  def valid_return_url?(url)
    uri = URI.parse(url.to_s)
    (uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)) && uri.host.present?
  rescue URI::InvalidURIError
    false
  end

  def find_or_create_payment!(payment_intent, stripe_account_id: :keep)
    Payment.find_or_initialize_by(order: @order).tap do |payment|
      attributes = {
        stripe_payment_intent_id: payment_intent.id,
        amount_cents: @order.total_cents,
        currency: @order.currency,
        platform_fee_cents: application_fee_amount,
        status: map_stripe_status(payment_intent.status)
      }
      attributes[:stripe_account_id] = stripe_account_id unless stripe_account_id == :keep
      payment.assign_attributes(attributes)
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
