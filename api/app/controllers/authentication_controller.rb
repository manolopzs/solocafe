class AuthenticationController < ApplicationController
  def signup
    user = User.new(user_params)
    if user.save
      token = JsonWebToken.encode(user_id: user.id, tv: user.token_version)
      render json: { user: user_payload(user), token: token }, status: :created
    else
      render json: signup_error_payload(user), status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by_email(params[:email])
    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id, tv: user.token_version)
      render json: { user: user_payload(user), token: token }
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def me
    authenticate_user!
    return if performed?

    render json: { user: user_payload(Current.user) }
  end

  def logout
    authenticate_user!
    return if performed?

    Current.user.revoke_tokens!
    head :no_content
  end

  private

  def user_params
    params.require(:user).permit(:email, :password)
  end

  # errors stays a list of readable messages for older clients.
  # error_codes and code are stable, machine-readable keys for the frontend.
  def signup_error_payload(user)
    error_codes = user.errors.details.transform_values { |details| details.map { |detail| detail[:error].to_s } }
    payload = { errors: user.errors.full_messages, error_codes: error_codes }
    payload[:code] = "email_taken" if user.errors.of_kind?(:email, :taken)
    payload
  end

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
