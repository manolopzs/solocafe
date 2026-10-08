class JsonWebToken
  SECRET = ENV.fetch("JWT_SECRET") { Rails.application.credentials.secret_key_base }
  EXPIRATION = 30.days

  def self.encode(payload)
    payload[:exp] = EXPIRATION.from_now.to_i
    JWT.encode(payload, SECRET, "HS256")
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET, true, { algorithm: "HS256" })
    decoded.first
  rescue JWT::DecodeError
    nil
  end
end
