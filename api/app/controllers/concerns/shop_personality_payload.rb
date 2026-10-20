module ShopPersonalityPayload
  extend ActiveSupport::Concern

  private

  def personality_fields(shop)
    {
      brand_color: shop.brand_color,
      display_font: shop.display_font,
      display_font_family: Shop::DISPLAY_FONTS[shop.display_font],
      hero_photo_url: hero_photo_url_for(shop)
    }
  end

  def hero_photo_url_for(shop)
    return nil unless shop.hero_photo.attached?

    rails_blob_url(shop.hero_photo, disposition: "inline")
  end
end
