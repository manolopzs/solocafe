class Notification < ApplicationRecord
  include TenantScoped

  self.inheritance_column = nil

  belongs_to :order, optional: true

  validates :notification_type, presence: true
  validates :channel, presence: true
  validates :status, presence: true
end
