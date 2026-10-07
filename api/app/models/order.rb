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
      "received" => %w[preparing cancelled],
      "preparing" => %w[ready cancelled],
      "ready" => %w[picked_up],
      "picked_up" => [],
      "cancelled" => []
    }
  end

  def can_transition_to?(next_status)
    self.class.state_machine[status].include?(next_status)
  end
end
