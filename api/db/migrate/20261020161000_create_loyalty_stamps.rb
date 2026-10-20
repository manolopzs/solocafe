class CreateLoyaltyStamps < ActiveRecord::Migration[8.1]
  def change
    add_column :shops, :loyalty_stamps_required, :integer, null: false, default: 10
    add_column :shops, :loyalty_reward_text, :string, null: false, default: "Un artículo gratis"

    add_column :orders, :discount_cents, :integer, null: false, default: 0
    add_column :orders, :loyalty_redeemed, :boolean, null: false, default: false

    create_table :loyalty_stamps, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :shop, null: false, foreign_key: true, type: :uuid
      t.references :customer, null: false, foreign_key: true, type: :uuid
      t.references :order, null: false, foreign_key: true, type: :uuid, index: { unique: true }
      t.string :status, null: false, default: "earned"
      t.datetime :reversed_at
      t.uuid :redemption_order_id
      t.timestamps
    end

    add_index :loyalty_stamps, :redemption_order_id
    add_index :loyalty_stamps, [ :shop_id, :customer_id, :status ], name: "index_loyalty_stamps_on_shop_customer_and_status"
    add_foreign_key :loyalty_stamps, :orders, column: :redemption_order_id
  end
end
