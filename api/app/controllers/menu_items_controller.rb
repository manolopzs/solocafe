class MenuItemsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!, only: [:create, :update, :destroy]
  before_action :set_current_shop!, only: [:index]

  def index
    items = Current.shop.menu_items.includes(photo_attachment: :blob).order(:sort_order)
    render json: { items: items.map { |i| item_payload(i) } }
  end

  def create
    item = Current.shop.menu_items.build(item_attributes)
    if item.save
      render json: { item: item_payload(item) }, status: :created
    else
      render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    item = Current.shop.menu_items.find(params[:id])
    attrs = item_params
    remove_photo = ActiveModel::Type::Boolean.new.cast(attrs.delete(:remove_photo))
    if item.update(attrs)
      item.photo.purge if remove_photo && attrs[:photo].blank? && item.photo.attached?
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

  def item_attributes
    item_params.to_h.except("remove_photo")
  end

  def item_params
    params.require(:menu_item).permit(
      :category_id, :name, :description, :price_cents,
      :image_url, :photo, :remove_photo, :is_active, :is_86ed, :prep_time_min, :sort_order,
      :may_contain_traces, allergens: []
    )
  end

  def item_payload(item)
    {
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      description: item.description,
      price_cents: item.price_cents,
      image_url: item.public_image_url,
      is_active: item.is_active,
      is_86ed: item.is_86ed,
      prep_time_min: item.prep_time_min,
      sort_order: item.sort_order,
      allergens: item.allergens,
      may_contain_traces: item.may_contain_traces
    }
  end
end
