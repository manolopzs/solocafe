class RenameTypeColumns < ActiveRecord::Migration[8.1]
  def change
    rename_column :events, :type, :event_type
    rename_column :notifications, :type, :notification_type
  end
end
