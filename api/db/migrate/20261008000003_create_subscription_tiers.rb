class CreateSubscriptionTiers < ActiveRecord::Migration[8.1]
  def change
    create_table :subscription_tiers, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.text :name, null: false
      t.integer :monthly_price_cents, null: false, default: 0
      t.integer :included_orders, null: false, default: 0
      t.integer :overage_per_order_cents, null: false, default: 0
      t.text :stripe_price_id
      t.boolean :is_active, null: false, default: true
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end
  end
end
