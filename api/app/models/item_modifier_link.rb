class ItemModifierLink < ApplicationRecord
  belongs_to :item, class_name: "MenuItem"
  belongs_to :group, class_name: "ModifierGroup"

  validates :group_id, uniqueness: { scope: :item_id }
end
