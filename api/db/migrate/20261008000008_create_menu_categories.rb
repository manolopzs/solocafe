class CreateMenuCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :menu_categories, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :shop, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.text :name, null: false
      t.integer :sort_order, null: false, default: 0
      t.boolean :is_active, null: false, default: true
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end
  end
end
