module TenantScoped
  extend ActiveSupport::Concern

  included do
    belongs_to :shop

    default_scope { where(shop_id: Current.shop.id) if Current.shop }

    validates :shop_id, presence: true
  end

  class_methods do
    # Named escape from the shop scope. Use this when the shop is not known yet,
    # then assign Current.shop. Do not rely on a missing Current.shop.
    def across_shops
      unscoped
    end
  end
end
