class CreateModifierOptions < ActiveRecord::Migration[8.1]
  def change
    create_table :modifier_options, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :group, type: :uuid, null: false, foreign_key: { to_table: :modifier_groups, on_delete: :cascade }
      t.text :name, null: false
      t.integer :price_cents, null: false, default: 0
      t.boolean :is_active, null: false, default: true
      t.integer :sort_order, null: false, default: 0
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end
  end
end
