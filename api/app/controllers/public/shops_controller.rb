module Public
  class ShopsController < ApplicationController
    include ShopPersonalityPayload
    include PublicHttpCache

    def index
      origin = origin_coordinates
      shops = Shop.explore(
        lat: origin&.first,
        lng: origin&.last,
        include_closed: include_closed?
      )

      render_public_json({
        sort: origin ? "distance" : "name",
        shops: shops.map { |shop| public_shop(shop, with_distance: origin.present?) }
      }, max_age: 15)
    end

    private

    def include_closed?
      ActiveModel::Type::Boolean.new.cast(params[:include_closed])
    end

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
