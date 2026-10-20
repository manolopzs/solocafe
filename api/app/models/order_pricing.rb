class OrderPricing
  Line = Struct.new(:unit_price_cents, :quantity, :subtotal_cents, keyword_init: true)

  def self.quote(shop, lines)
    priced = lines.map do |line|
      modifier_cents = Array(line[:modifiers]).sum { |modifier| modifier.price_cents.to_i }
      unit_price_cents = line[:menu_item].price_cents + modifier_cents
      quantity = line[:quantity].to_i
      Line.new(
        unit_price_cents: unit_price_cents,
        quantity: quantity,
        subtotal_cents: unit_price_cents * quantity
      )
    end

    subtotal_cents = priced.sum(&:subtotal_cents)
    totals = total_for(shop, subtotal_cents, 0)

    {
      lines: priced,
      subtotal_cents: subtotal_cents,
      discount_cents: totals[:discount_cents],
      tax_cents: totals[:tax_cents],
      total_cents: totals[:total_cents]
    }
  end

  def self.free_item_cents(lines)
    cents = Array(lines).map { |line| line.unit_price_cents.to_i }
    return 0 if cents.empty?

    cents.min
  end

  def self.total_for(shop, subtotal_cents, discount_cents)
    discount_cents = discount_cents.to_i.clamp(0, subtotal_cents)
    taxable_cents = subtotal_cents - discount_cents
    tax_cents = (taxable_cents * shop.tax_rate).round
    total_cents = shop.tax_included ? taxable_cents : taxable_cents + tax_cents

    {
      discount_cents: discount_cents,
      tax_cents: tax_cents,
      total_cents: total_cents
    }
  end
end
