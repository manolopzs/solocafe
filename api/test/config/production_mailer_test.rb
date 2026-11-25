require "test_helper"
require Rails.root.join("config/mailer_config")

class ProductionMailerTest < ActiveSupport::TestCase
  class FakeConfig
    attr_reader :action_mailer, :callbacks

    def initialize
      @action_mailer = ActiveSupport::OrderedOptions.new
      @callbacks = []
    end

    def after_initialize(&block)
      callbacks << block
    end
  end

  test "production uses smtp when SMTP_ADDRESS is present" do
    config = FakeConfig.new

    MailerConfig.configure(config, {
      "SMTP_ADDRESS" => "smtp.example.com",
      "APP_URL" => "https://app.example.com"
    })

    assert_equal :smtp, config.action_mailer.delivery_method
    assert ActionMailer::Base.delivery_methods.key?(config.action_mailer.delivery_method)
    assert_empty config.callbacks
  end

  test "production uses test delivery and logs a boot error when SMTP_ADDRESS is missing" do
    config = FakeConfig.new

    logs = capture_rails_logs do
      MailerConfig.configure(config, { "APP_URL" => "https://app.example.com" })
      config.callbacks.each(&:call)
    end

    assert_equal :test, config.action_mailer.delivery_method
    assert_not_equal :logger, config.action_mailer.delivery_method
    assert ActionMailer::Base.delivery_methods.key?(config.action_mailer.delivery_method)
    assert_equal 1, config.callbacks.length
    assert_includes logs, MailerConfig::SMTP_MISSING_MESSAGE
  end

  test "production builds default URL options from APP_URL" do
    options = MailerConfig.default_url_options({
      "APP_URL" => "https://login.example.com:8443",
      "CORS_ALLOWED_ORIGINS" => "https://ignored.example.com"
    })

    assert_equal({ host: "login.example.com", port: 8443, protocol: "https" }, options)
  end

  test "production safely falls back to the first allowed origin" do
    options = MailerConfig.default_url_options({
      "CORS_ALLOWED_ORIGINS" => "https://first.example.com, https://second.example.com"
    })

    assert_equal({ host: "first.example.com", port: 443, protocol: "https" }, options)
  end
end
