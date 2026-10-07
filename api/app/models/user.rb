class User < ApplicationRecord
  has_secure_password

  has_many :shop_memberships, class_name: "ShopMember", dependent: :destroy
  has_many :shops, through: :shop_memberships
  has_many :owned_shops, class_name: "Shop", foreign_key: :owner_id, dependent: :nullify
  has_many :customers, dependent: :nullify

  validates :email, presence: true, uniqueness: { case_insensitive: true }
  validates :password, length: { minimum: 8 }, if: -> { new_record? || !password.nil? }

  enum :role, { customer: "customer", admin: "admin" }, prefix: true
end
