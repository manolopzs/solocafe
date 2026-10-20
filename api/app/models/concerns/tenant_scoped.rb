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
      else
        raise MissingShop, "#{model.name} requires Current.shop"
      end
    end

    validates :shop_id, presence: true
    validate :shop_matches_current_tenant

    # Rails copies default scope attributes during Model.new. Skip that lookup
    # when no shop is current so building a record is not treated as a query.
    def self.scope_attributes
      return {} unless Current.shop || TenantScoped.system_access?

      super
    end
  end

  private

  def shop_matches_current_tenant
    return if TenantScoped.system_access?
    return if Current.shop.nil? && (!persisted? || !shop_id_changed?)
    return if Current.shop && shop_id == Current.shop.id

    errors.add(:shop_id, "does not match the current shop")
  end
end
