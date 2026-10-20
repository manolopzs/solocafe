class Order < ApplicationRecord
  include TenantScoped

  belongs_to :customer, optional: true
  belongs_to :pickup_slot, optional: true
  has_many :order_items, dependent: :destroy
  has_many :events, dependent: :destroy
  has_one :payment, dependent: :destroy
  has_one :slot_reservation, dependent: :destroy

  scope :kitchen, -> { where(status: KITCHEN_STATUSES, payment_status: KITCHEN_PAYMENT_STATUSES) }

  validates :subtotal_cents, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :total_cents, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :currency, presence: true, inclusion: { in: %w[MXN EUR] }

  enum :status, {
    pending_payment: "pending_payment",
    received: "received",
    preparing: "preparing",
    ready: "ready",
    picked_up: "picked_up",
    cancelled: "cancelled"
  }, prefix: true

  enum :payment_status, {
    pending: "pending",
    succeeded: "succeeded",
    failed: "failed",
    refunded: "refunded"
  }, prefix: true

  enum :pickup_type, {
    asap: "asap",
    scheduled: "scheduled"
  }, prefix: true

  KITCHEN_STATUSES = %w[received preparing ready].freeze
  KITCHEN_PAYMENT_STATUSES = %w[succeeded refunded].freeze

  def self.state_machine
    {
      "pending_payment" => %w[received cancelled],
      "received" => %w[preparing cancelled],
      "preparing" => %w[ready cancelled],
      "ready" => %w[picked_up],
      "picked_up" => [],
      "cancelled" => []
    }
  end

  def can_transition_to?(next_status)
    self.class.state_machine.fetch(status, []).include?(next_status)
  end

  # Kitchen staff can cancel an unpaid order. Only a successful payment moves it to received.
  def staff_can_transition_to?(next_status)
    return next_status == "cancelled" if status_pending_payment?

    can_transition_to?(next_status)
  end

  def apply_successful_payment!
    entering_kitchen = status_pending_payment? && can_transition_to?("received")
    attributes = { payment_status: "succeeded" }
    attributes[:status] = "received" if entering_kitchen
    update!(attributes)
    record_kitchen_arrival! if entering_kitchen
    return unless entering_kitchen

    LoyaltyStamp.award_paid_order!(self)
    LoyaltyStamp.fulfill_redemption!(self)
  end

  def allowed_transitions
    self.class.state_machine.fetch(status, []).select { |next_status| staff_can_transition_to?(next_status) }
  end

  def record_kitchen_arrival!
    TenantScoped.unscoped_for_system do
      return if Event.exists?(order_id: id, event_type: "order.kitchen_new")

      Event.create!(
        shop: shop,
        order: self,
        event_type: "order.kitchen_new",
        payload: { "to" => "received" }
      )
    end
    KitchenPush.enqueue(self)
  end

  def apply_failed_payment!
    return if payment_status_succeeded?

    attributes = { payment_status: "failed" }
    if status_pending_payment? && can_transition_to?("cancelled")
      attributes[:status] = "cancelled"
    end
    update!(attributes)
    return unless status_cancelled?

    release_slot!
    LoyaltyStamp.unwind!(self)
    update!(loyalty_redeemed: false) if loyalty_redeemed?
  end

  def apply_refund!
    return unless payment_status_succeeded? || payment_status_refunded?

    update!(payment_status: "refunded") unless payment_status_refunded?
    LoyaltyStamp.unwind!(self)
  end

  def release_slot!
    slot_reservation&.destroy!
  end

  GUEST_ACCESS_PURPOSE = "guest_access"
  GUEST_ACCESS_TTL = 14.days

  def guest_access_token
    signed_id(purpose: GUEST_ACCESS_PURPOSE, expires_in: GUEST_ACCESS_TTL)
  end

  def self.locate_by_guest_access_token(token)
    return nil if token.blank?

    verified_id = signed_id_verifier.verified(token, purpose: combine_signed_id_purposes(GUEST_ACCESS_PURPOSE))
    return nil if verified_id.blank?

    TenantScoped.unscoped_for_system { find_by(id: verified_id) }
  end
end
