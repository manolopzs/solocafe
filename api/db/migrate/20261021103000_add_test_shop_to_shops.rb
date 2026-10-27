class AddTestShopToShops < ActiveRecord::Migration[8.1]
  def change
    add_column :shops, :test_shop, :boolean, null: false, default: false
  end
end
