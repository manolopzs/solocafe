class CreateShopSubscriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :shop_subscriptions, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :shop, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.references :tier, type: :uuid, null: false, foreign_key: { to_table: :subscription_tiers }
      t.text :status, null: false, default: 'active'
      t.timestamptz :current_period_start
      t.timestamptz :current_period_end
      t.text :stripe_subscription_id
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
      t.timestamptz :updated_at, null: false, default: -> { 'now()' }
    end

    add_index :shop_subscriptions, :shop_id, unique: true
  end
end
