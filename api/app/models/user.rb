class User < ApplicationRecord
  has_secure_password

  generates_token_for :password_reset, expires_in: 30.minutes

  has_many :shop_memberships, class_name: "ShopMember", dependent: :destroy
  has_many :shops, through: :shop_memberships
  has_many :owned_shops, class_name: "Shop", foreign_key: :owner_id, dependent: :nullify
  has_many :customers, dependent: :nullify

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :password, length: { minimum: 8 }, if: -> { new_record? || !password.nil? }

  # Case-insensitive so rows saved before normalization still match.
  def self.find_by_email(email)
    normalized = normalize_value_for(:email, email.to_s)
    return nil if normalized.blank?

    where("LOWER(email) = ?", normalized).first
  end

  def owner?
    role_admin? || owned_shops.exists? || shop_memberships.exists?
  end

  enum :role, { customer: "customer", admin: "admin" }, prefix: true
end
