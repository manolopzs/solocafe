class CreateEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :events, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :shop, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.references :order, type: :uuid, foreign_key: { on_delete: :cascade }
      t.text :type, null: false
      t.jsonb :payload, null: false, default: {}
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end

    add_index :events, :order_id
  end
end
