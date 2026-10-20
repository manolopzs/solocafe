class AddAcceptingPickupToShops < ActiveRecord::Migration[8.1]
  def change
    add_column :shops, :accepting_pickup, :boolean, default: true, null: false
  end
end
