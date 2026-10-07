class CreateOrderItemModifiers < ActiveRecord::Migration[8.1]
  def change
    create_table :order_item_modifiers, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :order_item, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.references :option, type: :uuid, null: false, foreign_key: { to_table: :modifier_options }
      t.text :option_name_snapshot, null: false
      t.integer :price_cents, null: false, default: 0
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end
  end
end
