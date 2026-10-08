class ApplicationController < ActionController::API
  before_action :set_current_user

  private

  def set_current_user
    Current.user = current_user
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

  def set_current_shop!
    shop = Shop.active.find_by(id: params[:shop_id])
    if shop.nil?
      render json: { error: "Shop not found" }, status: :not_found
      return
    end

    Current.shop = shop
  end

  def require_shop_member!
    set_current_shop!
    return if performed?

    unless Current.shop.shop_members.exists?(user_id: Current.user.id)
      render json: { error: "Forbidden" }, status: :forbidden
    end
  end
end
