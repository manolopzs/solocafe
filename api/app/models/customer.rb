class Customer < ApplicationRecord
  belongs_to :user, optional: true
  has_many :orders, dependent: :nullify

  validates :phone, presence: true, if: -> { user_id.blank? }
end
