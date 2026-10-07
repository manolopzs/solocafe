class Event < ApplicationRecord
  include TenantScoped

  belongs_to :order, optional: true

  validates :type, presence: true
end
