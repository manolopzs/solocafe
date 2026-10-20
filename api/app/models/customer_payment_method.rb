class CustomerPaymentMethod < ApplicationRecord
  belongs_to :customer

  scope :for_customer, ->(customer) { where(customer: customer) }

  validates :stripe_payment_method_id, presence: true, uniqueness: true
  validates :last4, format: { with: /\A\d{4}\z/ }, allow_nil: true
  validates :exp_month, inclusion: { in: 1..12 }, allow_nil: true
  validates :exp_year, numericality: { only_integer: true, greater_than: 2000 }, allow_nil: true

  def self.store_for_customer!(customer, stripe_payment_method)
    return if customer.nil?
    return unless card_payment_method?(stripe_payment_method)

    record = find_or_initialize_by(stripe_payment_method_id: StripePayload.read(stripe_payment_method, :id))
    return if record.persisted? && record.customer_id != customer.id

    assign_card!(record, customer, stripe_payment_method)
  end

  def self.store_attached!(stripe_payment_method)
    customer_ref = StripePayload.read(stripe_payment_method, :customer)
    customer_ref = StripePayload.read(customer_ref, :id) unless customer_ref.is_a?(String) || customer_ref.nil?
    customer = Customer.find_by(stripe_customer_id: customer_ref)
    store_for_customer!(customer, stripe_payment_method)
  end

  def self.apply_card_update!(stripe_payment_method)
    return unless card_payment_method?(stripe_payment_method)

    record = find_by(stripe_payment_method_id: StripePayload.read(stripe_payment_method, :id))
    return if record.nil?

    card = StripePayload.read(stripe_payment_method, :card)
    record.update!(
      brand: StripePayload.read(card, :brand),
      last4: StripePayload.read(card, :last4),
      exp_month: StripePayload.read(card, :exp_month),
      exp_year: StripePayload.read(card, :exp_year)
    )
  end

  def self.card_payment_method?(stripe_payment_method)
    type = StripePayload.read(stripe_payment_method, :type)
    type.blank? || type == "card"
  end

  def self.assign_card!(record, customer, stripe_payment_method)
    card = StripePayload.read(stripe_payment_method, :card)
    record.customer = customer
    record.brand = StripePayload.read(card, :brand)
    record.last4 = StripePayload.read(card, :last4)
    record.exp_month = StripePayload.read(card, :exp_month)
    record.exp_year = StripePayload.read(card, :exp_year)
    record.save!
    record
  rescue ActiveRecord::RecordNotUnique
    existing = find_by(stripe_payment_method_id: record.stripe_payment_method_id)
    return if existing.nil? || existing.customer_id != customer.id

    existing.update!(
      brand: record.brand,
      last4: record.last4,
      exp_month: record.exp_month,
      exp_year: record.exp_year
    )
    existing
  end
  private_class_method :assign_card!, :card_payment_method?
end
