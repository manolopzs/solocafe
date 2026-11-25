require "uri"

module MailerConfig
  DEFAULT_APP_URL = "https://solo-cafe-nine.vercel.app"
  SMTP_MISSING_MESSAGE = "ActionMailer is using :test delivery_method because SMTP_ADDRESS is not set; emails will not be sent."

  module_function

  def delivery_method(env = ENV)
    env["SMTP_ADDRESS"].present? ? :smtp : :test
  end

  def default_url_options(env = ENV)
    uri = URI.parse(app_url(env))
    { host: uri.host, port: uri.port, protocol: uri.scheme }
  end

  def app_url(env = ENV)
    env["APP_URL"].presence ||
      env["CORS_ALLOWED_ORIGINS"].to_s.split(",").first.to_s.strip.presence ||
      DEFAULT_APP_URL
  end

  def configure(config, env = ENV)
    config.action_mailer.delivery_method = delivery_method(env)
    config.action_mailer.default_url_options = default_url_options(env)
    return if env["SMTP_ADDRESS"].present?

    config.after_initialize do
      Rails.logger.error(SMTP_MISSING_MESSAGE)
    end
  end
end
