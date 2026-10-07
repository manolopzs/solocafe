class CreateMenuItems < ActiveRecord::Migration[8.1]
  def change
    create_table :menu_items, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :shop, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.references :category, type: :uuid, foreign_key: { to_table: :menu_categories, on_delete: :nullify }
      t.text :name, null: false
      t.text :description
      t.integer :price_cents, null: false
      t.text :image_url
      t.boolean :is_active, null: false, default: true
      t.boolean :is_86ed, null: false, default: false
      t.integer :prep_time_min, null: false, default: 5
      t.integer :sort_order, null: false, default: 0
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
      t.timestamptz :updated_at, null: false, default: -> { 'now()' }
    end

    add_index :menu_items, :category_id
    add_index :menu_items, :shop_id
  end
end
