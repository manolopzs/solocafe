class Customer < ApplicationRecord
  belongs_to :user, optional: true
  has_many :orders, dependent: :nullify
  has_many :customer_favorites, dependent: :destroy
  has_many :customer_payment_methods, dependent: :destroy
  has_many :loyalty_stamps, dependent: :destroy

  validates :phone, presence: true, if: -> { user_id.blank? }
  validates :stripe_customer_id, uniqueness: true, allow_nil: true

  def ensure_platform_stripe_customer!
    TenantScoped.unscoped_for_system do
      next stripe_customer_id if stripe_customer_id.present?

      with_lock do
        reload
        next stripe_customer_id if stripe_customer_id.present?

        stripe_customer = Stripe::Customer.create(
          email: user&.email,
          name: name,
          metadata: { customer_id: id }
        )
        update!(stripe_customer_id: stripe_customer.id)
        stripe_customer_id
      end
    end
  end
end
