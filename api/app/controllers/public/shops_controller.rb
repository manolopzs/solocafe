module Public
  class ShopsController < ApplicationController
    def index
      shops = Shop.active.where.not(lat: nil, lng: nil).order(:name)

      render json: {
        shops: shops.map { |shop| shop_payload(shop) }
      }
    end

    private

    def shop_payload(shop)
      {
        id: shop.id,
        slug: shop.slug,
        name: shop.name,
        address: shop.address,
        currency: shop.currency,
        locale: shop.locale,
        lat: shop.lat,
        lng: shop.lng,
        brand_color: shop.brand_color
      }
    end
  end
end
