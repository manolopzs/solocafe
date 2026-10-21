class PushDevicesController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!

  def index
    devices = Current.shop.push_devices.where(audience: "kitchen").order(created_at: :desc)
    render json: { push_devices: devices.map { |device| push_device_payload(device) } }
  end

  def create
    device = PushDevice.register!(
      shop: Current.shop,
      user: current_user,
      attributes: push_device_params
    )
    status = device.previously_new_record? ? :created : :ok
    render json: { push_device: push_device_payload(device) }, status: status
  rescue ActiveRecord::RecordInvalid => error
    render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    device = Current.shop.push_devices.find(params[:id])
    device.destroy!
    head :no_content
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Push device not found" }, status: :not_found
  end

  private

  def push_device_params
    params.require(:push_device).permit(:platform, :endpoint, :token, :p256dh, :auth_key, keys: [ :p256dh, :auth ])
  end

  def push_device_payload(device)
    {
      id: device.id,
      shop_id: device.shop_id,
      platform: device.platform,
      endpoint: device.endpoint,
      token: device.token,
      created_at: device.created_at,
      updated_at: device.updated_at
    }
  end
end
