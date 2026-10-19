class Customer < ApplicationRecord
  belongs_to :user, optional: true
  has_many :orders, dependent: :nullify
  has_many :customer_favorites, dependent: :destroy

  validates :phone, presence: true, if: -> { user_id.blank? }
end
