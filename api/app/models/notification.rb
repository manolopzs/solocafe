class Notification < ApplicationRecord
  include TenantScoped

  belongs_to :order, optional: true

  validates :type, presence: true
  validates :channel, presence: true
  validates :status, presence: true
end
