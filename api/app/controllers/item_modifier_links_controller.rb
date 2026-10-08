class ItemModifierLinksController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!
  before_action :set_current_shop!

  def index
    links = Current.shop.item_modifier_links
    render json: { item_modifier_links: links.map { |l| link_payload(l) } }
  end

  def create
    item = Current.shop.menu_items.find(params[:item_id])
    group = Current.shop.modifier_groups.find(params[:group_id])

    link = ItemModifierLink.find_or_initialize_by(item: item, group: group)
    link.is_required = params[:is_required] || false

    if link.save
      render json: { item_modifier_link: link_payload(link) }, status: :created
    else
      render json: { errors: link.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    link = Current.shop.item_modifier_links.find(params[:id])
    link.destroy
    head :no_content
  end

  private

  def link_payload(link)
    {
      id: link.id,
      item_id: link.item_id,
      group_id: link.group_id,
      is_required: link.is_required
    }
  end
end
