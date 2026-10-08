class MenuItemsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!, only: [:create, :update, :destroy]
  before_action :set_current_shop!, only: [:index]

  def index
    items = Current.shop.menu_items.order(:sort_order)
    render json: { items: items.map { |i| item_payload(i) } }
  end

  def create
    item = Current.shop.menu_items.build(item_params)
    if item.save
      render json: { item: item_payload(item) }, status: :created
    else
      render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    item = Current.shop.menu_items.find(params[:id])
    if item.update(item_params)
      render json: { item: item_payload(item) }
    else
      render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    item = Current.shop.menu_items.find(params[:id])
    item.destroy
    head :no_content
  end

  private

  def item_params
    params.require(:menu_item).permit(
      :category_id, :name, :description, :price_cents,
      :image_url, :is_active, :is_86ed, :prep_time_min, :sort_order
    )
  end

  def item_payload(item)
    {
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      description: item.description,
      price_cents: item.price_cents,
      image_url: item.image_url,
      is_active: item.is_active,
      is_86ed: item.is_86ed,
      prep_time_min: item.prep_time_min,
      sort_order: item.sort_order
    }
  end
end
