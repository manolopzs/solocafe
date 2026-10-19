class CustomerFavoritesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_current_shop!

  def index
    favorites = current_customer.customer_favorites.where(shop: Current.shop).includes(:menu_item)
    render json: { favorites: favorites.map { |favorite| favorite_payload(favorite) } }
  end

  def create
    menu_item = Current.shop.menu_items.find(params[:menu_item_id])
    favorite = current_customer.customer_favorites.find_or_initialize_by(shop: Current.shop, menu_item: menu_item)

    if favorite.persisted?
      render json: { favorite: favorite_payload(favorite) }
    elsif favorite.save
      render json: { favorite: favorite_payload(favorite) }, status: :created
    else
      render json: { errors: favorite.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    favorite = current_customer.customer_favorites.find_by!(shop: Current.shop, menu_item_id: params[:menu_item_id])
    favorite.destroy
    head :no_content
  end

  private

  def favorite_payload(favorite)
    {
      id: favorite.id,
      shop_id: favorite.shop_id,
      menu_item_id: favorite.menu_item_id
    }
  end
end
