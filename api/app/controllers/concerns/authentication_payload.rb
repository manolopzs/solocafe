module AuthenticationPayload
  extend ActiveSupport::Concern

  private

  def user_payload(user)
    customer = user.customers.first
    {
      id: user.id,
      email: user.email,
      role: user.role,
      customer: customer ? { id: customer.id, name: customer.name, phone: customer.phone } : nil
    }
  end
end
