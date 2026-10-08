class StripeConnectController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!

  def create
    account_id = Current.shop.stripe_account_id

    if account_id.blank?
      account = Stripe::Account.create(
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        metadata: { shop_id: Current.shop.id }
      )
      account_id = account.id
      Current.shop.update!(stripe_account_id: account_id, stripe_connect_status: "pending")
    end

    account_link = Stripe::AccountLink.create(
      account: account_id,
      refresh_url: refresh_url,
      return_url: return_url,
      type: "account_onboarding"
    )

    render json: { url: account_link.url }
  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :bad_gateway
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  end

  private

  def connect_params
    params.permit(:refresh_url, :return_url)
  end

  def refresh_url
    connect_params[:refresh_url] || "#{request.base_url}/shops/#{Current.shop.id}/stripe/connect"
  end

  def return_url
    connect_params[:return_url] || "#{request.base_url}/shops/#{Current.shop.id}/stripe/connect/return"
  end
end
