class AuthenticationController < ApplicationController
  def signup
    user = User.new(user_params)
    if user.save
      token = JsonWebToken.encode(user_id: user.id)
      render json: { user: user_payload(user), token: token }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email].to_s.downcase)
    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)
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

  private

  def user_params
    params.require(:user).permit(:email, :password)
  end

  def user_payload(user)
    {
      id: user.id,
      email: user.email,
      role: user.role
    }
  end
end
