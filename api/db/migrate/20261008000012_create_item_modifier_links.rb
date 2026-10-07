class CreateItemModifierLinks < ActiveRecord::Migration[8.1]
  def change
    create_table :item_modifier_links, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :item, type: :uuid, null: false, foreign_key: { to_table: :menu_items, on_delete: :cascade }
      t.references :group, type: :uuid, null: false, foreign_key: { to_table: :modifier_groups, on_delete: :cascade }
      t.boolean :is_required, null: false, default: false
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end

    add_index :item_modifier_links, [:item_id, :group_id], unique: true
  end
end
