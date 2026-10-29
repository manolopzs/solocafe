class AddAllergensToMenuItems < ActiveRecord::Migration[8.1]
  def change
    add_column :menu_items, :allergens, :jsonb, null: false, default: []
    add_column :menu_items, :may_contain_traces, :boolean, null: false, default: false
  end
end
