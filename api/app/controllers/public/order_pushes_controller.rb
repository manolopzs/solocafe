module Public
  class OrderPushesController < ApplicationController
    def create
      order = TenantScoped.unscoped_for_system { Order.find_by(id: params[:id]) }
      return render json: { error: "Order not found" }, status: :not_found unless order
      return render json: { error: "Forbidden" }, status: :forbidden unless allowed?(order)

      Current.shop = order.shop
      device = PushDevice.register!(
        shop: order.shop,
        user: current_user,
        attributes: push_device_params.to_h.merge(
          "platform" => "web",
          "audience" => "customer",
          "order_id" => order.id
        )
      )
      status = device.previously_new_record? ? :created : :ok
      render json: { push_device: { id: device.id, platform: device.platform } }, status: status
    rescue ActiveRecord::RecordInvalid => error
      render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
    end

    private

    def allowed?(order)
      guest_token_matches?(order) || (current_user.present? && order.customer&.user_id == current_user.id)
    end

    def push_device_params
      params.require(:push_device).permit(:endpoint, :p256dh, :auth_key, keys: [ :p256dh, :auth ])
    end
  end
end