class PasswordResetMailer < ApplicationMailer
  def reset_email
    @user = params[:user]
    @token = params[:token]
    @url = params[:url]

    mail(
      to: @user.email,
      subject: "Reset your Solo Café password"
    )
  end
end
