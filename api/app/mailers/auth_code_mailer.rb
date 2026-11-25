class AuthCodeMailer < ApplicationMailer
  def login_code_email
    @user = params[:user]
    @code = params[:code]
    @login_url = params[:login_url]

    mail(
      to: @user.email,
      subject: "Your Solo Cafe login code"
    )
  end
end
