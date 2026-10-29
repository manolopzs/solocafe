class AddAllergenSnapshotsToOrderItems < ActiveRecord::Migration[8.1]
  def change
    add_column :order_items, :allergens_snapshot, :jsonb, null: false, default: []
    add_column :order_items, :may_contain_traces_snapshot, :boolean, null: false, default: false
  end
end
