class Shop < ApplicationRecord
  belongs_to :owner, class_name: "User", optional: true
  has_many :shop_members, dependent: :destroy
  has_many :users, through: :shop_members
  has_one :shop_subscription, dependent: :destroy
  has_many :menu_categories, dependent: :destroy
  has_many :menu_items, dependent: :destroy
  has_many :modifier_groups, dependent: :destroy
  has_many :orders, dependent: :destroy
  has_many :pickup_slots, dependent: :destroy
  has_many :events, dependent: :destroy
  has_many :notifications, dependent: :destroy

  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9-]+\z/ }
  validates :name, presence: true
  validates :currency, inclusion: { in: %w[MXN EUR] }
  validates :locale, inclusion: { in: %w[es en] }

  scope :active, -> { where(status: "active") }
end
