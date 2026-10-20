class FixOrderPaymentAndSlotCapacity < ActiveRecord::Migration[8.1]
  def change
    add_column :shops, :slot_capacity, :integer, null: false, default: 10

    change_column_default :orders, :status, from: "received", to: "pending_payment"

    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          UPDATE orders
          SET status = 'pending_payment'
          WHERE status = 'received' AND payment_status = 'pending'
        SQL
      end
    end

    create_table :stripe_webhook_events, id: :uuid do |t|
      t.string :stripe_event_id, null: false
      t.string :event_type, null: false
      t.timestamps
    end
    add_index :stripe_webhook_events, :stripe_event_id, unique: true

    add_index :pickup_slots,
      [ :shop_id, :slot_date, :start_time ],
      unique: true,
      name: "index_pickup_slots_on_shop_date_and_start"
  end
end
