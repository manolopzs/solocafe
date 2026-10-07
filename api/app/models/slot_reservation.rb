class SlotReservation < ApplicationRecord
  belongs_to :slot, class_name: "PickupSlot"
  belongs_to :order

  validates :order_id, uniqueness: true
end
