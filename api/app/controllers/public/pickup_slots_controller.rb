module Public
  class PickupSlotsController < ApplicationController
    def index
      shop = Shop.active.find_by(id: params[:shop_id])
      return render json: { error: "Shop not found" }, status: :not_found unless shop

      Current.shop = shop

      date = parse_date(params[:date])
      return render json: { error: "Invalid date" }, status: :bad_request unless date

      slots = shop.available_slots_for(date)
      render json: { slots: slots }
    end

    private

    def parse_date(value)
      return Time.zone.today if value.blank?

      Date.parse(value)
    rescue ArgumentError
      nil
    end
  end
end
