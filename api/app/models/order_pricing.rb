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
    tax_cents = (subtotal_cents * shop.tax_rate).round
    total_cents = shop.tax_included ? subtotal_cents : subtotal_cents + tax_cents

    {
      lines: priced,
      subtotal_cents: subtotal_cents,
      tax_cents: tax_cents,
      total_cents: total_cents
    }
  end
end
