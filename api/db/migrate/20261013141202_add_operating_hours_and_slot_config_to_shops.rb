class AddOperatingHoursAndSlotConfigToShops < ActiveRecord::Migration[8.1]
  def change
    add_column :shops, :operating_hours, :jsonb, default: {}
    add_column :shops, :slot_duration_minutes, :integer, default: 15, null: false
    add_column :shops, :prep_time_buffer_minutes, :integer, default: 10, null: false
    add_column :shops, :max_days_ahead, :integer, default: 7, null: false
  end
end
