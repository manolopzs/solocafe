module Public
  class MenusController < ApplicationController
    include PublicHttpCache

    def show
      shop = Shop.active.find_by(id: params[:shop_id])
      return render json: { error: "Shop not found" }, status: :not_found unless shop

      Current.shop = shop
      render_public_json(menu_document(shop))
    end

    private

    def menu_document(shop)
      {
        shop: {
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          currency: shop.currency,
          locale: shop.locale,
          timezone: shop.timezone,
          address: shop.address,
          lat: shop.lat&.to_f,
          lng: shop.lng&.to_f,
          operating_hours: shop.operating_hours,
          slot_duration_minutes: shop.slot_duration_minutes,
          prep_time_buffer_minutes: shop.prep_time_buffer_minutes,
          max_days_ahead: shop.max_days_ahead,
          ordering: shop.ordering_payload
        }
      }.merge(PublicCatalog.for(shop))
    end
  end
end
