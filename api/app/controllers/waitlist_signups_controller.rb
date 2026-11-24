class WaitlistSignupsController < ApplicationController
  SUCCESS_MESSAGE = "You're on the list. We'll let you know when the iOS app is out.".freeze

  rate_limit to: 5, within: 15.minutes,
    by: -> { params.dig(:waitlist_signup, :email).to_s.strip.downcase },
    with: :render_rate_limited,
    name: "per-email",
    only: :create
  rate_limit to: 20, within: 15.minutes,
    with: :render_rate_limited,
    name: "per-ip",
    only: :create

  def create
    signup = WaitlistSignup.join!(email: signup_params[:email], source: signup_params[:source])

    if signup.errors.any?
      render json: { errors: signup.errors.full_messages }, status: :unprocessable_entity
    else
      # Same response for new and repeat emails, so the endpoint never reveals who is on the list.
      render json: { message: SUCCESS_MESSAGE }, status: :ok
    end
  end

  private

  def signup_params
    params.require(:waitlist_signup).permit(:email, :source)
  end
end
