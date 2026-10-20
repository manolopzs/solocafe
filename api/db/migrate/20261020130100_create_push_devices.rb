class CreatePushDevices < ActiveRecord::Migration[8.1]
  def change
    create_table :push_devices, id: :uuid do |t|
      t.references :shop, null: false, foreign_key: true, type: :uuid
      t.references :user, null: true, foreign_key: true, type: :uuid
      t.string :platform, null: false
      t.string :endpoint
      t.string :p256dh
      t.string :auth_key
      t.string :token
      t.timestamps
    end

    add_index :push_devices, [ :shop_id, :endpoint ],
      unique: true,
      where: "endpoint IS NOT NULL",
      name: "index_push_devices_on_shop_and_endpoint"
    add_index :push_devices, [ :shop_id, :token ],
      unique: true,
      where: "token IS NOT NULL",
      name: "index_push_devices_on_shop_and_token"
  end
end
