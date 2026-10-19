class CreateCustomerFavorites < ActiveRecord::Migration[8.1]
  def change
    create_table :customer_favorites, id: :uuid do |t|
      t.references :customer, null: false, foreign_key: true, type: :uuid
      t.references :shop, null: false, foreign_key: true, type: :uuid
      t.references :menu_item, null: false, foreign_key: true, type: :uuid
      t.timestamps
    end

    add_index :customer_favorites, [:customer_id, :shop_id, :menu_item_id], unique: true, name: "index_customer_favorites_uniqueness"
  end
end
