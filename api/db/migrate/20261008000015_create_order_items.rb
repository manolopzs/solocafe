class CreateOrderItems < ActiveRecord::Migration[8.1]
  def change
    create_table :order_items, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :order, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.references :item, type: :uuid, null: false, foreign_key: { to_table: :menu_items }
      t.text :item_name_snapshot, null: false
      t.integer :unit_price_cents, null: false
      t.integer :quantity, null: false, default: 1
      t.integer :subtotal_cents, null: false
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end
  end
end
