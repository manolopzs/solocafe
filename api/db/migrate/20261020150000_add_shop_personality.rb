class AddShopPersonality < ActiveRecord::Migration[8.1]
  def up
    # #000000 was an unused placeholder. The previous CSS accent #c17c5b fails WCAG AA.
    # #8c3d25 is the existing terracotta 700 and clears 4.5:1 on the cream canvas.
    change_column_default :shops, :brand_color, from: "#000000", to: "#8c3d25"
    execute "UPDATE shops SET brand_color = '#8c3d25' WHERE lower(brand_color) = '#000000'"
    add_column :shops, :display_font, :string, null: false, default: "dm_sans"
  end

  def down
    remove_column :shops, :display_font
    change_column_default :shops, :brand_color, from: "#8c3d25", to: "#000000"
  end
end
