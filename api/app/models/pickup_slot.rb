class PickupSlot < ApplicationRecord
  include TenantScoped

  has_many :slot_reservations, foreign_key: :slot_id, dependent: :destroy
  has_many :orders, foreign_key: :pickup_slot_id, dependent: :nullify

  validates :slot_date, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :capacity, numericality: { greater_than_or_equal_to: 0 }
end
