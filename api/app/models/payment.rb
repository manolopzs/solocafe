class Payment < ApplicationRecord
  belongs_to :order

  validates :amount_cents, numericality: { greater_than_or_equal_to: 0 }
  validates :currency, presence: true

  enum :status, {
    pending: "pending",
    succeeded: "succeeded",
    failed: "failed",
    refunded: "refunded"
  }, prefix: true
end
