class ApplicationController < ActionController::API
  include GuestOrderAccess

  before_action :set_current_user
  before_action :set_active_storage_url_options

  private

  def set_current_user
    Current.user = current_user
  end

  def set_active_storage_url_options
    options = { protocol: request.protocol.delete_suffix("://"), host: request.host }
    options[:port] = request.port unless request.port.in?([ 80, 443 ])
    ActiveStorage::Current.url_options = options
  end

  def current_user
    return @current_user if defined?(@current_user)

    token = request.headers["Authorization"]&.split(" ")&.last
    return nil if token.blank?

    payload = JsonWebToken.decode(token)
    @current_user = User.find_by(id: payload["user_id"]) if payload
  end

  def authenticate_user!
    render json: { error: "Unauthorized" }, status: :unauthorized unless current_user
  end

  def current_customer
    return nil unless current_user

    Customer.find_or_create_by!(user_id: current_user.id) do |customer|
      customer.name = current_user.email.split("@").first
    end
  end

  def set_current_shop!
    shop = Shop.find_by(id: params[:shop_id])
    unless shop && shop_visible?(shop)
      render json: { error: "Shop not found" }, status: :not_found
      return
    end

    Current.shop = shop
  end

  def shop_visible?(shop)
    return true if shop.status == "active"

    current_user.present? && shop.shop_members.exists?(user_id: current_user.id)
  end

  def require_shop_member!
    set_current_shop!
    return if performed?

    unless Current.shop.shop_members.exists?(user_id: Current.user.id)
      render json: { error: "Forbidden" }, status: :forbidden
    end
  end

  def ensure_stripe_configured!
    return if StripeConfig.configured?

    PaymentLog.error("payment.stripe_not_configured", order_id: (@order.id if defined?(@order) && @order), shop_id: Current.shop&.id)
    render json: { error: "stripe_not_configured" }, status: :service_unavailable
  end
end
