class PasswordResetsController < ApplicationController
  rate_limit to: 5, within: 15.minutes,
    by: -> { params[:email].to_s.strip.downcase },
    with: :render_rate_limited,
    name: "per-email",
    only: :create
  rate_limit to: 30, within: 15.minutes,
    with: :render_rate_limited,
    name: "per-ip",
    only: :create
  rate_limit to: 20, within: 15.minutes,
    with: :render_rate_limited,
    only: :update

  def create
    user = User.find_by_email(params[:email])

    if user
      token = user.generate_token_for(:password_reset)
      url = frontend_reset_url(token, from_account: params[:from] == "account")
      PasswordResetMailer.with(user: user, token: token, url: url).reset_email.deliver_later
    end

    render json: { message: "If that email exists, you will receive password reset instructions." }, status: :ok
  end

  def update
    user = User.find_by_token_for(:password_reset, params[:token].to_s)

    unless user
      return render json: { error: "The reset link is invalid or has expired." }, status: :unprocessable_entity
    end

    if user.update(password: params[:password])
      render json: { message: "Your password has been updated.", account: user.owner? ? "owner" : "customer" }, status: :ok
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  # from=account sends customers back to /account/login after the reset.
  def frontend_reset_url(token, from_account: false)
    base = ENV.fetch("APP_URL") do
      ENV.fetch("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",").first.to_s.strip
    end
    uri = URI.parse(base)
    path = "/auth/reset-password"
    query_params = { token: token }
    query_params[:from] = "account" if from_account
    query = URI.encode_www_form(query_params)
    "#{uri.scheme}://#{uri.host}#{uri.port && ![80, 443].include?(uri.port) ? ":#{uri.port}" : ""}#{path}?#{query}"
  end
end
