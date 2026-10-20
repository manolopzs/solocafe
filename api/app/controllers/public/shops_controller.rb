module Public
  class ShopsController < ApplicationController
    include ShopPersonalityPayload

    def index
      origin = origin_coordinates
      shops = Shop.explore(lat: origin&.first, lng: origin&.last)

      render json: {
        sort: origin ? "distance" : "name",
        shops: shops.map { |shop| public_shop(shop, with_distance: origin.present?) }
      }
    end

    private

    def origin_coordinates
      return nil if params[:lat].blank? || params[:lng].blank?

      lat = Float(params[:lat])
      lng = Float(params[:lng])
      return nil unless lat.finite? && lng.finite?
      return nil unless lat.between?(-90.0, 90.0) && lng.between?(-180.0, 180.0)

      [ lat, lng ]
    rescue ArgumentError, TypeError
      nil
    end

    def public_shop(shop, with_distance:)
      payload = {
        name: shop.name,
        slug: shop.slug,
        address: shop.address,
        open_now: shop.open_now?,
        brand_color: shop.brand_color,
        display_font: shop.display_font,
        hero_photo_url: hero_photo_url_for(shop)
      }
      return payload unless with_distance

      raw = shop.read_attribute("distance_km")
      payload.merge(distance_km: raw.nil? ? nil : raw.to_f.round(3))
    end
  end
end
