module Public
  class CartsController < ApplicationController
    def preview
      shop = Shop.active.find_by(id: params[:shop_id])
      return render json: { error: "Shop not found" }, status: :not_found unless shop

      Current.shop = shop
      pickup_type = params[:pickup_type].presence || "asap"
      lines = CartLineCheck.inspect_items(shop, preview_items)
      available_lines = lines.select { |line| line[:available] }
      quote = OrderPricing.quote(shop, available_lines.filter_map { |line| pricing_line(line) })
      loyalty = loyalty_for(shop)
      discount_cents = redemption_discount(loyalty, quote)
      totals = OrderPricing.total_for(shop, quote[:subtotal_cents], discount_cents)
      minutes = PickupEstimate.minutes_for(
        shop: shop,
        lines: available_lines,
        queue_count: PickupEstimate.queue_count(shop)
      )
      window = PickupEstimate.window_for(shop: shop, minutes: minutes, pickup_type: pickup_type)
      reason = shop.checkout_blocked_reason(pickup_type)
      reason = "empty" if reason.nil? && lines.empty?
      reason = "item_unavailable" if reason.nil? && lines.any? { |line| !line[:available] }

      render json: {
        ordering: shop.ordering_payload,
        estimated_ready_minutes: minutes,
        pickup_window_starts_at: window[:starts_at]&.iso8601,
        pickup_window_ends_at: window[:ends_at]&.iso8601,
        subtotal_cents: quote[:subtotal_cents],
        discount_cents: totals[:discount_cents],
        tax_cents: totals[:tax_cents],
        total_cents: totals[:total_cents],
        loyalty: loyalty,
        currency: shop.currency,
        lines: lines.map { |line| public_line(line) },
        can_checkout: reason.nil?,
        checkout_blocked_reason: reason
      }
    end

    private

    def loyalty_for(shop)
      return nil unless current_user

      customer = Customer.find_by(user_id: current_user.id)
      return nil unless customer

      LoyaltyStamp.progress_for(customer, shop)
    end

    def redemption_discount(loyalty, quote)
      return 0 unless loyalty && ActiveModel::Type::Boolean.new.cast(params[:redeem_loyalty])
      return 0 unless loyalty[:can_redeem]

      OrderPricing.free_item_cents(quote[:lines])
    end

    def preview_items
      Array(params[:items]).map do |item|
        item.permit(:menu_item_id, :quantity, modifier_option_ids: [])
      end
    end

    def pricing_line(line)
      return nil unless line[:menu_item]

      { menu_item: line[:menu_item], quantity: line[:quantity], modifiers: line[:modifiers] }
    end

    def public_line(line)
      line.except(:menu_item, :modifiers, :prep_time_min)
    end
  end
end
