class CreateShopMembers < ActiveRecord::Migration[8.1]
  def change
    create_table :shop_members, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :shop, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.references :user, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.text :role, null: false, default: 'barista'
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end

    add_index :shop_members, :user_id
    add_index :shop_members, [:shop_id, :user_id], unique: true
  end
end
