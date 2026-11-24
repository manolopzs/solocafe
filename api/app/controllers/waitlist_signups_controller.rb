class WaitlistSignupsController < ApplicationController
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
    signup = WaitlistSignup.join!(email: waitlist_signup_params[:email], source: waitlist_signup_params[:source])

    if signup.persisted?
      render json: { message: "You're on the list. We'll let you know when the iOS app is out." }, status: :ok
    else
      render json: { errors: signup.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def waitlist_signup_params
    params.require(:waitlist_signup).permit(:email, :source)
  end
end
