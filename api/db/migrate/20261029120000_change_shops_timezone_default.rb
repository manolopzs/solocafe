class ChangeShopsTimezoneDefault < ActiveRecord::Migration[8.1]
  def up
    change_column_default :shops, :timezone, from: "America/Mexico_City", to: "Europe/Madrid"
  end

  def down
    change_column_default :shops, :timezone, from: "Europe/Madrid", to: "America/Mexico_City"
  end
end
