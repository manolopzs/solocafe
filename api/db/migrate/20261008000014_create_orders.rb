class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :shop, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.references :customer, type: :uuid, foreign_key: { on_delete: :nullify }
      t.text :status, null: false, default: 'received'
      t.text :payment_status, null: false, default: 'pending'
      t.integer :subtotal_cents, null: false
      t.integer :tax_cents, null: false, default: 0
      t.integer :tip_cents, null: false, default: 0
      t.integer :total_cents, null: false
      t.text :currency, null: false
      t.text :pickup_type, null: false, default: 'asap'
      t.references :pickup_slot, type: :uuid, foreign_key: { on_delete: :nullify }
      t.timestamptz :pickup_time
      t.text :customer_name
      t.text :customer_phone
      t.text :special_instructions
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
      t.timestamptz :updated_at, null: false, default: -> { 'now()' }
    end

    add_index :orders, [:shop_id, :status]
    add_index :orders, :customer_id
  end
end
