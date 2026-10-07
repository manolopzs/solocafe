class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_table :payments, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :order, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.text :stripe_payment_intent_id
      t.text :stripe_charge_id
      t.integer :amount_cents, null: false
      t.integer :platform_fee_cents, null: false, default: 0
      t.text :currency, null: false
      t.text :status, null: false, default: 'pending'
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
      t.timestamptz :updated_at, null: false, default: -> { 'now()' }
    end

    add_index :payments, :order_id, unique: true
  end
end
