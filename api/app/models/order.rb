class Order < ApplicationRecord
  include TenantScoped

  belongs_to :customer, optional: true
  belongs_to :pickup_slot, optional: true
  has_many :order_items, dependent: :destroy
  has_one :payment, dependent: :destroy
  has_one :slot_reservation, dependent: :destroy

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
    attributes = { payment_status: "succeeded" }
    if status_pending_payment? && can_transition_to?("received")
      attributes[:status] = "received"
    end
    update!(attributes)
  end

  def apply_failed_payment!
    return if payment_status_succeeded?

    attributes = { payment_status: "failed" }
    if status_pending_payment? && can_transition_to?("cancelled")
      attributes[:status] = "cancelled"
    end
    update!(attributes)
    release_slot! if status_cancelled?
  end

  def release_slot!
    slot_reservation&.destroy!
  end
end
