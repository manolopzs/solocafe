class ShopsController < ApplicationController
  include ShopPayload

  before_action :authenticate_user!, except: [:show]

  def index
    shops = current_user.shops.order(:name)
    render json: { shops: shops.map { |s| shop_payload(s, include_onboarding: true) } }
  end

  def show
    shop = Shop.discoverable.find_by!(slug: params[:slug])
    render json: { shop: shop_payload(shop) }
  end

  def create
    shop = nil
    ActiveRecord::Base.transaction do
      shop = Shop.new(prepared_shop_attributes)
      shop.owner = current_user
      shop.status = "draft"
      shop.save!
      ShopMember.create!(shop: shop, user: current_user, role: :owner)
      ShopSubscription.create!(
        shop: shop,
        tier: SubscriptionTier.find_by!(name: "Free"),
        status: :active
      )
      ShopOnboarding.seed_starter_menu!(shop) if seed_starter_menu?
    end

    render json: { shop: shop_payload(shop, include_onboarding: true) }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages.presence || [ e.message ] }, status: :unprocessable_entity
  end

  def update
    shop = current_user.shops.find_by(id: params[:id])
    if shop.nil?
      render json: { error: "Shop not found" }, status: :not_found
      return
    end

    Current.shop = shop
    attrs = shop_params
    remove_hero = ActiveModel::Type::Boolean.new.cast(attrs.delete(:remove_hero_photo))

    if shop.update(attrs)
      shop.hero_photo.purge if remove_hero && attrs[:hero_photo].blank? && shop.hero_photo.attached?
      render json: { shop: shop_payload(shop, include_onboarding: true) }
    else
      render json: { errors: shop.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def shop_params
    day = %i[is_open open close]
    params.require(:shop).permit(
      :name, :slug, :timezone, :currency, :locale,
      :tax_included, :tax_rate, :address, :lat, :lng, :brand_color, :display_font,
      :hero_photo, :remove_hero_photo,
      :slot_duration_minutes, :slot_capacity, :prep_time_buffer_minutes, :max_days_ahead,
      :accepting_pickup, :loyalty_stamps_required, :loyalty_reward_text,
      operating_hours: { mon: day, tue: day, wed: day, thu: day, fri: day, sat: day, sun: day }
    )
  end

  def prepared_shop_attributes
    attrs = shop_params.to_h
    attrs["slug"] = ShopOnboarding.unique_slug(attrs["name"], attrs["slug"])
    attrs
  end

  def seed_starter_menu?
    ActiveModel::Type::Boolean.new.cast(params[:seed_starter_menu])
  end

end
