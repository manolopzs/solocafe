class CreateModifierGroups < ActiveRecord::Migration[8.1]
  def change
    create_table :modifier_groups, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :shop, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.text :name, null: false
      t.integer :min_select, null: false, default: 0
      t.integer :max_select, null: false, default: 1
      t.integer :sort_order, null: false, default: 0
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end
  end
end
