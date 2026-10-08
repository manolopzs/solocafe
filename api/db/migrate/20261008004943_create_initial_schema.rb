class CreateInitialSchema < ActiveRecord::Migration[8.1]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    create_table :subscription_tiers, id: :uuid do |t|
      t.string :name, null: false
      t.integer :monthly_price_cents, null: false, default: 0
      t.integer :included_orders, null: false, default: 0
      t.integer :overage_per_order_cents, null: false, default: 0
      t.string :stripe_price_id
      t.boolean :is_active, null: false, default: true
      t.timestamps
    end

    create_table :users, id: :uuid do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :role, null: false, default: "customer"
      t.timestamps
    end
    add_index :users, :email, unique: true

    create_table :shops, id: :uuid do |t|
      t.string :slug, null: false
      t.string :name, null: false
      t.string :legal_name
      t.string :timezone, null: false, default: "America/Mexico_City"
      t.string :currency, null: false, default: "MXN"
      t.string :locale, null: false, default: "es"
      t.boolean :tax_included, null: false, default: true
      t.decimal :tax_rate, precision: 5, scale: 4, null: false, default: 0
      t.text :address
      t.decimal :lat, precision: 10, scale: 8
      t.decimal :lng, precision: 11, scale: 8
      t.string :logo_url
      t.string :brand_color, null: false, default: "#000000"
      t.string :stripe_account_id
      t.string :stripe_connect_status, null: false, default: "pending"
      t.references :owner, null: true, foreign_key: { to_table: :users }, type: :uuid
      t.string :status, null: false, default: "active"
      t.timestamps
    end
    add_index :shops, :slug, unique: true

    create_table :shop_members, id: :uuid do |t|
      t.references :shop, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :role, null: false, default: "barista"
      t.timestamps
    end
    add_index :shop_members, [:shop_id, :user_id], unique: true

    create_table :shop_subscriptions, id: :uuid do |t|
      t.references :shop, null: false, foreign_key: true, type: :uuid, index: { unique: true }
      t.references :tier, null: false, foreign_key: { to_table: :subscription_tiers }, type: :uuid
      t.string :status, null: false, default: "active"
      t.datetime :current_period_start
      t.datetime :current_period_end
      t.string :stripe_subscription_id
      t.timestamps
    end

    create_table :customers, id: :uuid do |t|
      t.references :user, null: true, foreign_key: true, type: :uuid
      t.string :name
      t.string :phone
      t.string :email
      t.timestamps
    end

    create_table :menu_categories, id: :uuid do |t|
      t.references :shop, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.integer :sort_order, null: false, default: 0
      t.boolean :is_active, null: false, default: true
      t.timestamps
    end

    create_table :menu_items, id: :uuid do |t|
      t.references :shop, null: false, foreign_key: true, type: :uuid
      t.references :category, null: true, foreign_key: { to_table: :menu_categories }, type: :uuid
      t.string :name, null: false
      t.text :description
      t.integer :price_cents, null: false
      t.string :image_url
      t.boolean :is_active, null: false, default: true
      t.boolean :is_86ed, null: false, default: false
      t.integer :prep_time_min, null: false, default: 5
      t.integer :sort_order, null: false, default: 0
      t.timestamps
    end

    create_table :modifier_groups, id: :uuid do |t|
      t.references :shop, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.integer :min_select, null: false, default: 0
      t.integer :max_select, null: false, default: 1
      t.integer :sort_order, null: false, default: 0
      t.timestamps
    end

    create_table :modifier_options, id: :uuid do |t|
      t.references :group, null: false, foreign_key: { to_table: :modifier_groups }, type: :uuid
      t.string :name, null: false
      t.integer :price_cents, null: false, default: 0
      t.boolean :is_active, null: false, default: true
      t.integer :sort_order, null: false, default: 0
      t.timestamps
    end

    create_table :item_modifier_links, id: :uuid do |t|
      t.references :item, null: false, foreign_key: { to_table: :menu_items }, type: :uuid
      t.references :group, null: false, foreign_key: { to_table: :modifier_groups }, type: :uuid
      t.boolean :is_required, null: false, default: false
      t.timestamps
    end
    add_index :item_modifier_links, [:item_id, :group_id], unique: true

    create_table :pickup_slots, id: :uuid do |t|
      t.references :shop, null: false, foreign_key: true, type: :uuid
      t.date :slot_date, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.integer :capacity, null: false, default: 10
      t.timestamps
    end

    create_table :orders, id: :uuid do |t|
      t.references :shop, null: false, foreign_key: true, type: :uuid
      t.references :customer, null: true, foreign_key: true, type: :uuid
      t.string :status, null: false, default: "received"
      t.string :payment_status, null: false, default: "pending"
      t.integer :subtotal_cents, null: false
      t.integer :tax_cents, null: false, default: 0
      t.integer :tip_cents, null: false, default: 0
      t.integer :total_cents, null: false
      t.string :currency, null: false
      t.string :pickup_type, null: false, default: "asap"
      t.references :pickup_slot, null: true, foreign_key: true, type: :uuid
      t.datetime :pickup_time
      t.string :customer_name
      t.string :customer_phone
      t.text :special_instructions
      t.timestamps
    end

    create_table :order_items, id: :uuid do |t|
      t.references :order, null: false, foreign_key: true, type: :uuid
      t.references :item, null: false, foreign_key: { to_table: :menu_items }, type: :uuid
      t.string :item_name_snapshot, null: false
      t.integer :unit_price_cents, null: false
      t.integer :quantity, null: false, default: 1
      t.integer :subtotal_cents, null: false
      t.timestamps
    end

    create_table :order_item_modifiers, id: :uuid do |t|
      t.references :order_item, null: false, foreign_key: true, type: :uuid
      t.references :option, null: false, foreign_key: { to_table: :modifier_options }, type: :uuid
      t.string :option_name_snapshot, null: false
      t.integer :price_cents, null: false, default: 0
      t.timestamps
    end

    create_table :payments, id: :uuid do |t|
      t.references :order, null: false, foreign_key: true, type: :uuid, index: { unique: true }
      t.string :stripe_payment_intent_id
      t.string :stripe_charge_id
      t.integer :amount_cents, null: false
      t.integer :platform_fee_cents, null: false, default: 0
      t.string :currency, null: false
      t.string :status, null: false, default: "pending"
      t.timestamps
    end
    add_index :payments, :stripe_payment_intent_id

    create_table :slot_reservations, id: :uuid do |t|
      t.references :slot, null: false, foreign_key: { to_table: :pickup_slots }, type: :uuid
      t.references :order, null: false, foreign_key: true, type: :uuid, index: { unique: true }
      t.timestamps
    end

    create_table :events, id: :uuid do |t|
      t.references :shop, null: false, foreign_key: true, type: :uuid
      t.references :order, null: true, foreign_key: true, type: :uuid
      t.string :type, null: false
      t.jsonb :payload, null: false, default: {}
      t.timestamps
    end

    create_table :notifications, id: :uuid do |t|
      t.references :shop, null: false, foreign_key: true, type: :uuid
      t.references :order, null: true, foreign_key: true, type: :uuid
      t.string :type, null: false
      t.string :channel, null: false
      t.string :status, null: false, default: "pending"
      t.string :external_id
      t.timestamps
    end
  end
end
