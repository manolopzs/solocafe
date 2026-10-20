class PickupEstimate
  MAX_MINUTES = 60
  WINDOW_MINUTES = 5

  def self.lines_for(order)
    order.order_items.map do |order_item|
      {
        prep_time_min: order_item.item&.prep_time_min.to_i,
        quantity: order_item.quantity.to_i
      }
    end
  end

  def self.active_order_ids(shop)
    shop.orders.where(status: %w[received preparing]).pluck(:id)
  end

  def self.queue_count(shop, exclude_order_id: nil)
    queue_count_for(active_order_ids(shop), exclude_order_id)
  end

  def self.queue_count_for(active_ids, order_id)
    count = active_ids.length
    count -= 1 if order_id && active_ids.include?(order_id)
    count
  end

  def self.minutes_for(shop:, lines:, queue_count:)
    item_minutes = Array(lines).sum { |line| line[:prep_time_min].to_i * line[:quantity].to_i }
    [ shop.prep_time_buffer_minutes.to_i + item_minutes + queue_count.to_i, MAX_MINUTES ].min
  end

  def self.window_for(shop:, minutes:, pickup_type:, pickup_time: nil, pickup_slot: nil)
    if pickup_type.to_s == "scheduled" && pickup_time.present?
      {
        starts_at: pickup_time,
        ends_at: scheduled_end(shop, pickup_time, pickup_slot)
      }
    else
      starts_at = Time.current + minutes.to_i.minutes
      { starts_at: starts_at, ends_at: starts_at + WINDOW_MINUTES.minutes }
    end
  end

  def self.scheduled_end(shop, pickup_time, pickup_slot)
    return pickup_time + shop.slot_duration_minutes.minutes unless pickup_slot

    local = pickup_time.in_time_zone(shop.timezone)
    ending = pickup_slot.end_time
    Time.use_zone(shop.timezone) do
      Time.zone.local(local.year, local.month, local.day, ending.hour, ending.min, ending.sec)
    end
  end
end
