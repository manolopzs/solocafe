class ChangeShopsBrandColorDefaultToNull < ActiveRecord::Migration[8.1]
  # New shops start without a brand colour, so Solo Cafe's neutral palette renders until a shop
  # picks one. Existing rows keep their current value; no data is rewritten here.
  def change
    change_column_null :shops, :brand_color, true
    change_column_default :shops, :brand_color, from: "#8c3d25", to: nil
  end
end
