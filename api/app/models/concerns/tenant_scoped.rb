module TenantScoped
  extend ActiveSupport::Concern

  included do
    belongs_to :shop

    default_scope { where(shop_id: Current.shop.id) if Current.shop }

    validates :shop_id, presence: true
  end
end
