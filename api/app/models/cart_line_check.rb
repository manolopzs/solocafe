class CartLineCheck
  def self.inspect_items(shop, raw_items)
    Array(raw_items).map { |raw| inspect_item(shop, raw) }
  end

  def self.inspect_item(shop, raw)
    menu_item_id = raw[:menu_item_id].to_s
    quantity = raw[:quantity].to_i
    modifier_ids = Array(raw[:modifier_option_ids]).map(&:to_s).reject(&:blank?)
    menu_item = shop.menu_items.find_by(id: menu_item_id)

    available = true
    reason = nil

    if menu_item.nil? || !menu_item.is_active || menu_item.is_86ed || quantity < 1
      available = false
      reason = "sold_out"
    else
      invalid_modifier = modifier_ids.find { |modifier_id| !modifier_available?(menu_item, modifier_id) }
      if invalid_modifier
        available = false
        reason = "modifier_unavailable"
      end
    end

    modifiers = available ? ModifierOption.where(id: modifier_ids).to_a : []
    unit_price_cents = if available
      menu_item.price_cents + modifiers.sum(&:price_cents)
    else
      0
    end

    {
      menu_item_id: menu_item_id,
      quantity: quantity,
      modifier_option_ids: modifier_ids,
      name: menu_item&.name,
      image_url: menu_item&.image_url,
      available: available,
      unavailable_reason: reason,
      prep_time_min: available ? menu_item.prep_time_min.to_i : 0,
      unit_price_cents: unit_price_cents,
      line_total_cents: unit_price_cents * [ quantity, 0 ].max,
      menu_item: available ? menu_item : nil,
      modifiers: modifiers
    }
  end

  def self.modifier_available?(menu_item, modifier_id)
    menu_item.modifier_groups.joins(:modifier_options).exists?(modifier_options: { id: modifier_id, is_active: true })
  end
end
