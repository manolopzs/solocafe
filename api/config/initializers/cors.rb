Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins = ENV["CORS_ALLOWED_ORIGINS"].to_s
      .split(",")
      .map(&:strip)
      .reject(&:blank?)

    allowed_origins = if origins.any?
      origins
    elsif Rails.env.production?
      [ "https://solocafe.vercel.app" ]
    else
      [ "http://localhost:3000", "http://127.0.0.1:3000" ]
    end

    origins(*allowed_origins)

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
