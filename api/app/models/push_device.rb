class PushDevice < ApplicationRecord
  include TenantScoped

  PLATFORMS = %w[web expo].freeze

  belongs_to :user, optional: true

  validates :platform, inclusion: { in: PLATFORMS }
  validates :endpoint, :p256dh, :auth_key, presence: true, if: :platform_web?
  validates :token, presence: true, if: :platform_expo?
  validates :endpoint, uniqueness: { scope: :shop_id }, allow_nil: true
  validates :token, uniqueness: { scope: :shop_id }, allow_nil: true

  before_validation :clear_unused_credentials

  def self.register!(shop:, user:, attributes:, attempt: 0)
    attrs = attributes.to_h.deep_symbolize_keys
    platform = attrs[:platform].to_s
    endpoint = attrs[:endpoint].presence
    token = attrs[:token].presence
    keys = attrs[:keys].is_a?(Hash) ? attrs[:keys].deep_symbolize_keys : {}
    p256dh = attrs[:p256dh].presence || keys[:p256dh].presence
    auth_key = attrs[:auth_key].presence || keys[:auth].presence

    record = locate(shop, platform, endpoint, token) || shop.push_devices.build
    record.user = user
    record.platform = platform
    if platform == "web"
      record.endpoint = endpoint
      record.p256dh = p256dh
      record.auth_key = auth_key
      record.token = nil
    else
      record.token = token
      record.endpoint = nil
      record.p256dh = nil
      record.auth_key = nil
    end
    record.save!
    record
  rescue ActiveRecord::RecordNotUnique
    raise if attempt >= 1

    register!(shop: shop, user: user, attributes: attributes, attempt: attempt + 1)
  end

  def self.locate(shop, platform, endpoint, token)
    if platform == "web" && endpoint.present?
      shop.push_devices.find_by(platform: "web", endpoint: endpoint)
    elsif platform == "expo" && token.present?
      shop.push_devices.find_by(platform: "expo", token: token)
    end
  end

  def platform_web?
    platform == "web"
  end

  def platform_expo?
    platform == "expo"
  end

  private

  def clear_unused_credentials
    self.endpoint = endpoint.presence
    self.p256dh = p256dh.presence
    self.auth_key = auth_key.presence
    self.token = token.presence
  end
end
