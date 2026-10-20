class CustomerPaymentMethodsController < ApplicationController
  before_action :authenticate_user!

  def index
    cards = CustomerPaymentMethod.for_customer(current_customer).order(created_at: :desc)
    render json: { payment_methods: cards.map { |card| payment_method_payload(card) } }
  end

  def destroy
    card = CustomerPaymentMethod.for_customer(current_customer).find(params[:id])
    Stripe::PaymentMethod.detach(card.stripe_payment_method_id)
    card.destroy!
    render json: { deleted: true }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Payment method not found" }, status: :not_found
  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :bad_gateway
  end

  private

  def payment_method_payload(card)
    {
      id: card.id,
      brand: card.brand,
      last4: card.last4,
      exp_month: card.exp_month,
      exp_year: card.exp_year
    }
  end
end
