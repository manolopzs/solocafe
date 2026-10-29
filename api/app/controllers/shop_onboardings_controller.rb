class ShopOnboardingsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!

  def show
    render json: { onboarding: ShopOnboarding.snapshot(Current.shop) }
  end

  def go_live
    render json: { onboarding: ShopOnboarding.go_live!(Current.shop) }
  rescue ShopOnboarding::NotReady
    render json: { error: "not_ready", onboarding: ShopOnboarding.snapshot(Current.shop) }, status: :unprocessable_entity
  end
end
