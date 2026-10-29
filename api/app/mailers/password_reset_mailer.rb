class PasswordResetMailer < ApplicationMailer
  def reset_email
    @user = params[:user]
    @token = params[:token]
    @url = params[:url]

    mail(
      to: @user.email,
      subject: "Restablece tu contraseña de Solo Café"
    )
  end
end
