module Public
  class MenusController < ApplicationController
    def show
      shop = Shop.active.find_by(id: params[:shop_id])
      return render json: { error: "Shop not found" }, status: :not_found unless shop

      Current.shop = shop

      categories = shop.menu_categories.where(is_active: true).order(:sort_order)
      items = shop.menu_items.where(is_active: true).order(:sort_order)
      item_ids = items.map(&:id)
      links = ItemModifierLink.where(item_id: item_ids)
      group_ids = links.map(&:group_id).uniq
      groups = ModifierGroup.where(id: group_ids).order(:sort_order)
      options = ModifierOption.where(group_id: group_ids, is_active: true).order(:sort_order)

      render json: {
        shop: {
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          currency: shop.currency,
          locale: shop.locale
        },
        categories: categories.map { |c| category_payload(c) },
        items: items.map { |i| item_payload(i) },
        modifier_groups: groups.map { |g| group_payload(g) },
        modifier_options: options.map { |o| option_payload(o) },
        item_modifier_links: links.map { |l| link_payload(l) }
      }
    end

    private

    def category_payload(category)
      {
        id: category.id,
        name: category.name,
        sort_order: category.sort_order
      }
    end

    def item_payload(item)
      {
        id: item.id,
        category_id: item.category_id,
        name: item.name,
        description: item.description,
        price_cents: item.price_cents,
        image_url: item.image_url,
        prep_time_min: item.prep_time_min,
        sort_order: item.sort_order,
        is_86ed: item.is_86ed
      }
    end

    def group_payload(group)
      {
        id: group.id,
        name: group.name,
        min_select: group.min_select,
        max_select: group.max_select,
        sort_order: group.sort_order
      }
    end

    def option_payload(option)
      {
        id: option.id,
        group_id: option.group_id,
        name: option.name,
        price_cents: option.price_cents,
        sort_order: option.sort_order
      }
    end

    def link_payload(link)
      {
        id: link.id,
        item_id: link.item_id,
        group_id: link.group_id,
        is_required: link.is_required
      }
    end
  end
end
