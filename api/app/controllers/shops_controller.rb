class ShopsController < ApplicationController
  before_action :authenticate_user!, except: [:show]

  def index
    shops = current_user.shops.order(:name)
    render json: { shops: shops.map { |s| shop_payload(s) } }
  end

  def show
    shop = Shop.active.find_by!(slug: params[:slug])
    render json: { shop: shop_payload(shop) }
  end

  def create
    ActiveRecord::Base.transaction do
      @shop = Shop.new(shop_params.merge(owner: current_user))
      @shop.status = "active"
      @shop.operating_hours = Shop::DEFAULT_HOURS if @shop.operating_hours.blank?

      if @shop.save
        ShopMember.create!(shop: @shop, user: current_user, role: :owner)
        ShopSubscription.create!(
          shop: @shop,
          tier: SubscriptionTier.find_by!(name: "Free"),
          status: :active
        )
        render json: { shop: shop_payload(@shop) }, status: :created
      else
        render json: { errors: @shop.errors.full_messages }, status: :unprocessable_entity
      end
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  end

  def update
    require_shop_member!
    return if performed?

    if Current.shop.update(shop_params)
      render json: { shop: shop_payload(Current.shop) }
    else
      render json: { errors: Current.shop.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def shop_params
    params.require(:shop).permit(
      :name, :slug, :timezone, :currency, :locale,
      :tax_included, :tax_rate, :address, :brand_color,
      :slot_duration_minutes, :slot_capacity, :prep_time_buffer_minutes, :max_days_ahead,
      operating_hours: {}
    )
  end

  def shop_payload(shop)
    {
      id: shop.id,
      slug: shop.slug,
      name: shop.name,
      timezone: shop.timezone,
      currency: shop.currency,
      locale: shop.locale,
      tax_included: shop.tax_included,
      tax_rate: shop.tax_rate,
      address: shop.address,
      brand_color: shop.brand_color,
      stripe_connect_status: shop.stripe_connect_status,
      status: shop.status,
      operating_hours: shop.operating_hours,
      slot_duration_minutes: shop.slot_duration_minutes,
      slot_capacity: shop.slot_capacity,
      prep_time_buffer_minutes: shop.prep_time_buffer_minutes,
      max_days_ahead: shop.max_days_ahead
    }
  end
end
