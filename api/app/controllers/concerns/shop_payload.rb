module ShopPayload
  extend ActiveSupport::Concern
  include ShopPersonalityPayload

  private

  def shop_payload(shop, include_onboarding: false)
    payload = {
      id: shop.id,
      slug: shop.slug,
      name: shop.name,
      timezone: shop.timezone,
      currency: shop.currency,
      locale: shop.locale,
      tax_included: shop.tax_included,
      tax_rate: shop.tax_rate,
      address: shop.address,
      lat: shop.lat&.to_f,
      lng: shop.lng&.to_f,
      logo_url: shop.logo_url,
      stripe_connect_status: shop.stripe_connect_status,
      status: shop.status,
      operating_hours: shop.operating_hours,
      slot_duration_minutes: shop.slot_duration_minutes,
      slot_capacity: shop.slot_capacity,
      prep_time_buffer_minutes: shop.prep_time_buffer_minutes,
      max_days_ahead: shop.max_days_ahead,
      accepting_pickup: shop.accepting_pickup?,
      loyalty_stamps_required: shop.loyalty_stamps_required,
      loyalty_reward_text: shop.loyalty_reward_text,
      ordering: shop.ordering_payload
    }.merge(personality_fields(shop))
    payload[:onboarding] = ShopOnboarding.snapshot(shop) if include_onboarding
    payload
  end
end
