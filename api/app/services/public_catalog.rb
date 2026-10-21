class PublicCatalog
  def self.for(shop)
    categories = shop.menu_categories.where(is_active: true).order(:sort_order).to_a
    items = shop.menu_items.where(is_active: true).includes(photo_attachment: :blob).order(:sort_order).to_a
    item_ids = items.map(&:id)
    links = item_ids.empty? ? [] : ItemModifierLink.where(item_id: item_ids).to_a
    group_ids = links.map(&:group_id).uniq
    groups = group_ids.empty? ? [] : ModifierGroup.where(id: group_ids).order(:sort_order).to_a
    options = group_ids.empty? ? [] : ModifierOption.where(group_id: group_ids, is_active: true).order(:sort_order).to_a

    {
      categories: categories.map { |category| category_payload(category) },
      items: items.map { |item| item_payload(item) },
      modifier_groups: groups.map { |group| group_payload(group) },
      modifier_options: options.map { |option| option_payload(option) },
      item_modifier_links: links.map { |link| link_payload(link) }
    }
  end

  def self.category_payload(category)
    {
      id: category.id,
      name: category.name,
      sort_order: category.sort_order
    }
  end

  def self.item_payload(item)
    {
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      description: item.description,
      price_cents: item.price_cents,
      image_url: item.public_image_url,
      prep_time_min: item.prep_time_min,
      sort_order: item.sort_order,
      is_active: item.is_active,
      is_86ed: item.is_86ed
    }
  end

  def self.group_payload(group)
    {
      id: group.id,
      name: group.name,
      min_select: group.min_select,
      max_select: group.max_select,
      sort_order: group.sort_order
    }
  end

  def self.option_payload(option)
    {
      id: option.id,
      group_id: option.group_id,
      name: option.name,
      price_cents: option.price_cents,
      sort_order: option.sort_order
    }
  end

  def self.link_payload(link)
    {
      id: link.id,
      item_id: link.item_id,
      group_id: link.group_id,
      is_required: link.is_required
    }
  end
end
