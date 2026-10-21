class CustomerFlowPolish < ActiveRecord::Migration[8.1]
  def change
    change_column_default :shops, :currency, from: "MXN", to: "EUR"

    add_column :orders, :customer_email, :string

    add_column :push_devices, :audience, :string, null: false, default: "kitchen"
    add_column :push_devices, :order_id, :uuid
    add_index :push_devices, :order_id
    add_index :push_devices, [ :audience, :order_id ]
    add_foreign_key :push_devices, :orders
  end
end
