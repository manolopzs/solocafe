class CreateShops < ActiveRecord::Migration[8.1]
  def change
    create_table :shops, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.text :slug, null: false
      t.text :name, null: false
      t.text :legal_name
      t.text :timezone, null: false, default: 'America/Mexico_City'
      t.text :currency, null: false, default: 'MXN'
      t.text :locale, null: false, default: 'es'
      t.boolean :tax_included, null: false, default: true
      t.decimal :tax_rate, precision: 5, scale: 4, null: false, default: 0
      t.text :address
      t.decimal :lat, precision: 10, scale: 8
      t.decimal :lng, precision: 11, scale: 8
      t.text :logo_url
      t.text :brand_color, default: '#000000'
      t.text :stripe_account_id
      t.text :stripe_connect_status, null: false, default: 'pending'
      t.references :owner, type: :uuid, foreign_key: { to_table: :users, on_delete: :nullify }
      t.text :status, null: false, default: 'active'
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
      t.timestamptz :updated_at, null: false, default: -> { 'now()' }
    end

    add_index :shops, :slug, unique: true
    add_index :shops, :owner_id
  end
end
