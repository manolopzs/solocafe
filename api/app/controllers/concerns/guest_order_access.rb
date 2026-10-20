module GuestOrderAccess
  extend ActiveSupport::Concern

  private

  def guest_access_token_from_request
    header = request.headers["X-Order-Token"]
    return header if header.present?

    token = params[:token]
    token.is_a?(String) ? token.presence : nil
  end

  def order_from_guest_token
    Order.locate_by_guest_access_token(guest_access_token_from_request)
  end

  def guest_token_matches?(order)
    found = order_from_guest_token
    found.present? && found.id == order.id
  end
end
