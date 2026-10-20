class UsualOrder
  Result = Struct.new(:order, :times_ordered, keyword_init: true)

  def self.select(customer:, shop:)
    orders = customer.orders
      .where(shop_id: shop.id, payment_status: "succeeded")
      .where.not(status: "cancelled")
      .includes(order_items: :order_item_modifiers)
      .to_a

    return nil if orders.empty?

    grouped = orders.group_by { |order| signature(order) }
    _signature, group = grouped.max_by do |_signature, matches|
      [ matches.size, matches.max_by(&:created_at).created_at ]
    end

    Result.new(order: group.max_by(&:created_at), times_ordered: group.size)
  end

  def self.signature(order)
    order.order_items.map do |order_item|
      [
        order_item.item_id,
        order_item.quantity,
        order_item.order_item_modifiers.map(&:option_id).sort
      ]
    end.sort
  end
end
