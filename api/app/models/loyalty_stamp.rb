class LoyaltyStamp < ApplicationRecord
  include TenantScoped

  class Unavailable < StandardError; end

  belongs_to :customer
  belongs_to :order
  belongs_to :redemption_order, class_name: "Order", optional: true

  enum :status, {
    earned: "earned",
    reserved: "reserved",
    redeemed: "redeemed",
    reversed: "reversed"
  }, prefix: true

  def self.award_paid_order!(order)
    return if order.customer_id.blank?

    with_shop(order.shop) do
      create_or_find_by!(order_id: order.id) do |stamp|
        stamp.shop = order.shop
        stamp.customer_id = order.customer_id
        stamp.status = "earned"
      end
    end
  rescue ActiveRecord::RecordNotUnique
    nil
  end

  def self.redeem!(order, customer, lines)
    order.discount_cents = 0
    discount = OrderPricing.free_item_cents(lines)
    subtotal = lines.sum { |line| line.subtotal_cents.to_i }
    raise Unavailable if discount <= 0 || discount > subtotal

    reserve!(order, customer)
    totals = OrderPricing.total_for(order.shop, subtotal, discount)
    order.update!(totals.merge(subtotal_cents: subtotal, loyalty_redeemed: true))
    order
  end

  def self.reserve!(order, customer)
    with_shop(order.shop) do
      required = order.shop.loyalty_stamps_required
      stamps = where(customer: customer, status: "earned").order(:created_at, :id).lock.limit(required).to_a
      raise Unavailable if customer.nil? || stamps.size < required

      stamps.each { |stamp| stamp.update!(status: "reserved", redemption_order: order) }
      stamps
    end
  end

  def self.fulfill_redemption!(order)
    return unless order.loyalty_redeemed?

    with_shop(order.shop) do
      where(redemption_order_id: order.id, status: "reserved").update_all(status: "redeemed", updated_at: Time.current)
    end
  end

  def self.unwind!(order)
    with_shop(order.shop) do
      where(redemption_order_id: order.id, status: %w[reserved redeemed]).update_all(
        status: "earned",
        redemption_order_id: nil,
        updated_at: Time.current
      )
      stamp = find_by(order_id: order.id)
      return if stamp.nil? || stamp.status_reversed?

      stamp.update!(status: "reversed", reversed_at: Time.current)
    end
  end

  def self.progress_for(customer, shop)
    with_shop(shop) do
      stamps = where(customer: customer, status: "earned").count
      required = shop.loyalty_stamps_required
      {
        shop_id: shop.id,
        shop_name: shop.name,
        shop_slug: shop.slug,
        stamps: stamps,
        stamps_required: required,
        reward_text: shop.loyalty_reward_text,
        can_redeem: stamps >= required
      }
    end
  end

  def self.cards_for(customer)
    shop_ids = TenantScoped.unscoped_for_system do
      where(customer_id: customer.id).distinct.pluck(:shop_id)
    end
    Shop.where(id: shop_ids).order(:name).map { |shop| progress_for(customer, shop) }
  end

  def self.with_shop(shop)
    previous = Current.shop
    Current.shop = shop
    yield
  ensure
    Current.shop = previous
  end
  private_class_method :with_shop
end
