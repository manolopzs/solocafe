module TenantScoped
  class MissingShop < StandardError; end

  THREAD_KEY = :tenant_scoped_system_access

  def self.unscoped_for_system
    previous = Thread.current[THREAD_KEY]
    Thread.current[THREAD_KEY] = true
    yield
  ensure
    Thread.current[THREAD_KEY] = previous
  end

  def self.system_access?
    Thread.current[THREAD_KEY] == true
  end

  extend ActiveSupport::Concern

  included do
    belongs_to :shop

    default_scope do
      if TenantScoped.system_access?
        nil
      elsif Current.shop
        where(shop_id: Current.shop.id)
      end
    end

    validates :shop_id, presence: true
  end
end
