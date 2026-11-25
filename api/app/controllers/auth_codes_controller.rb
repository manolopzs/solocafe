class AuthCodesController < ApplicationController
  include AuthenticationPayload

  rate_limit to: 5, within: 15.minutes,
    by: -> { params[:email].to_s.strip.downcase },
    with: :render_rate_limited,
    name: "per-email",
    only: :request_code
  rate_limit to: 20, within: 15.minutes,
    with: :render_rate_limited,
    name: "per-ip",
    only: :request_code
  rate_limit to: 10, within: 15.minutes,
    by: -> { params[:email].to_s.strip.downcase },
    with: :render_rate_limited,
    name: "verify-per-email",
    only: :verify
  rate_limit to: 30, within: 15.minutes,
    with: :render_rate_limited,
    name: "verify-per-ip",
    only: :verify

  def request_code
    email = params[:email].to_s.strip.downcase
    unless email.present? && URI::MailTo::EMAIL_REGEXP.match?(email)
      return render json: { error: "Enter a valid email address." }, status: :unprocessable_entity
    end

    user = User.find_by_email(email)
    if user
      _record, code = EmailLoginCode.issue_for!(user)
      login_url = frontend_login_url(user)
      AuthCodeMailer.with(user: user, code: code, login_url: login_url).login_code_email.deliver_later
    end

    render json: { message: "If that email exists, we sent a 6-digit login code." }, status: :ok
  end

  def verify
    user = User.find_by_email(params[:email])
    if user && EmailLoginCode.verify_for(user, params[:code])
      token = JsonWebToken.encode(user_id: user.id, tv: user.token_version)
      render json: { user: user_payload(user), token: token }, status: :ok
    else
      render json: { error: "Invalid or expired code." }, status: :unauthorized
    end
  end

  private

  def frontend_login_url(user)
    base = ENV["APP_URL"].presence ||
      ENV["CORS_ALLOWED_ORIGINS"].to_s.split(",").first.to_s.strip.presence ||
      "http://localhost:3000"
    uri = URI.parse(base)
    path = params[:from] == "account" || !user.owner? ? "/account/login" : "/auth/login"
    port = uri.port && ![80, 443].include?(uri.port) ? ":#{uri.port}" : ""
    "#{uri.scheme}://#{uri.host}#{port}#{path}"
  end
end
