module Public
  class StorefrontsController < ApplicationController
    include ShopPayload
    include PublicHttpCache

    def show
      shop = Shop.discoverable.includes(hero_photo_attachment: :blob).find_by(slug: params[:slug])
      return render json: { error: "Shop not found" }, status: :not_found unless shop

      Current.shop = shop
      render_public_json({
        shop: shop_payload(shop),
        **PublicCatalog.for(shop)
      })
    end
  end
end