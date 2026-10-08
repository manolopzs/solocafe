class Event < ApplicationRecord
  include TenantScoped

  self.inheritance_column = nil

  belongs_to :order, optional: true

  validates :event_type, presence: true
end
