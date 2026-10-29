require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.enable_reloading = false

  # Eager load code on boot for better performance and memory savings (ignored by Rake tasks).
  config.eager_load = true

  # Full error reports are disabled.
  config.consider_all_requests_local = false

  # Cache assets for far-future expiry since they are all digest stamped.
  config.public_file_server.headers = { "cache-control" => "public, max-age=#{1.year.to_i}" }

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.asset_host = "http://assets.example.com"

  # Render terminates TLS. Treat requests as HTTPS so hero photo URLs are https.
  config.assume_ssl = true

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = true

  # Skip http-to-https redirect for the default health check endpoint.
  config.ssl_options = { redirect: { exclude: ->(request) { request.path == "/up" } } }

  # Log to STDOUT with the current request id as a default log tag.
  config.log_tags = [ :request_id ]
  config.logger   = ActiveSupport::TaggedLogging.logger(STDOUT)

  # Change to "debug" to log everything (including potentially personally-identifiable information!).
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  # Prevent health checks from clogging up the logs.
  config.silence_healthcheck_path = "/up"

  # Don't log any deprecations.
  config.active_support.report_deprecations = false

  # Replace the default in-process memory cache store with a durable alternative.
  # config.cache_store = :mem_cache_store

  # Solid Queue runs in this process when SOLID_QUEUE_IN_PUMA is set.
  config.active_job.queue_adapter = :solid_queue
  config.solid_queue.silence_polling = true

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  # Only use :id for inspections in production.
  config.active_record.attributes_for_inspect = [ :id ]

  require_relative "../active_storage_config"
  config.active_storage.service = ActiveStorageConfig.service_name
  unless ActiveStorageConfig.configured?
    config.after_initialize do
      Rails.logger.warn(
        "Active Storage is using local disk because R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or R2_BUCKET is missing."
      )
    end
  end

  config.action_mailer.delivery_method = if ENV["SMTP_ADDRESS"].present?
    :smtp
  else
    :logger
  end

  config.action_mailer.smtp_settings = {
    address: ENV["SMTP_ADDRESS"].to_s,
    port: ENV.fetch("SMTP_PORT", "587").to_i,
    user_name: ENV["SMTP_USER_NAME"].to_s,
    password: ENV["SMTP_PASSWORD"].to_s,
    authentication: ENV.fetch("SMTP_AUTHENTICATION", "plain").to_sym,
    enable_starttls_auto: ENV.fetch("SMTP_ENABLE_STARTTLS", "true") == "true"
  }

  config.action_mailer.default_url_options = begin
    app_url = ENV.fetch("APP_URL", ENV.fetch("CORS_ALLOWED_ORIGINS", "https://solo-cafe-nine.vercel.app").split(",").first.to_s)
    uri = URI.parse(app_url)
    { host: uri.host, port: uri.port, protocol: uri.scheme }
  end

  # Enable DNS rebinding protection and other `Host` header attacks.
  # config.hosts = [
  #   "example.com",     # Allow requests from example.com
  #   /.*\.example\.com/ # Allow requests from subdomains like `www.example.com`
  # ]
  #
  # Skip DNS rebinding protection for the default health check endpoint.
  # config.host_authorization = { exclude: ->(request) { request.path == "/up" } }
end
