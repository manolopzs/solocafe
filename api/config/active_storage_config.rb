module ActiveStorageConfig
  R2_KEYS = %w[R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET].freeze

  def self.service_name(env = ENV)
    configured?(env) ? :cloudflare : :local
  end

  def self.configured?(env = ENV)
    R2_KEYS.all? { |key| env[key].present? }
  end
end
