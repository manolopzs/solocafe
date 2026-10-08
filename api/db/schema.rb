# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_08_010000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "customers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id"
    t.string "name"
    t.string "phone"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_customers_on_user_id"
  end

  create_table "events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "shop_id", null: false
    t.uuid "order_id"
    t.string "event_type", null: false
    t.jsonb "payload", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_events_on_order_id"
    t.index ["shop_id"], name: "index_events_on_shop_id"
  end

  create_table "item_modifier_links", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "item_id", null: false
    t.uuid "group_id", null: false
    t.boolean "is_required", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id"], name: "index_item_modifier_links_on_group_id"
    t.index ["item_id", "group_id"], name: "index_item_modifier_links_on_item_id_and_group_id", unique: true
    t.index ["item_id"], name: "index_item_modifier_links_on_item_id"
  end

  create_table "menu_categories", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "shop_id", null: false
    t.string "name", null: false
    t.integer "sort_order", default: 0, null: false
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id"], name: "index_menu_categories_on_shop_id"
  end

  create_table "menu_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "shop_id", null: false
    t.uuid "category_id"
    t.string "name", null: false
    t.text "description"
    t.integer "price_cents", null: false
    t.string "image_url"
    t.boolean "is_active", default: true, null: false
    t.boolean "is_86ed", default: false, null: false
    t.integer "prep_time_min", default: 5, null: false
    t.integer "sort_order", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_menu_items_on_category_id"
    t.index ["shop_id"], name: "index_menu_items_on_shop_id"
  end

  create_table "modifier_groups", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "shop_id", null: false
    t.string "name", null: false
    t.integer "min_select", default: 0, null: false
    t.integer "max_select", default: 1, null: false
    t.integer "sort_order", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id"], name: "index_modifier_groups_on_shop_id"
  end

  create_table "modifier_options", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "group_id", null: false
    t.string "name", null: false
    t.integer "price_cents", default: 0, null: false
    t.boolean "is_active", default: true, null: false
    t.integer "sort_order", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id"], name: "index_modifier_options_on_group_id"
  end

  create_table "notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "shop_id", null: false
    t.uuid "order_id"
    t.string "notification_type", null: false
    t.string "channel", null: false
    t.string "status", default: "pending", null: false
    t.string "external_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_notifications_on_order_id"
    t.index ["shop_id"], name: "index_notifications_on_shop_id"
  end

  create_table "order_item_modifiers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "order_item_id", null: false
    t.uuid "option_id", null: false
    t.string "option_name_snapshot", null: false
    t.integer "price_cents", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["option_id"], name: "index_order_item_modifiers_on_option_id"
    t.index ["order_item_id"], name: "index_order_item_modifiers_on_order_item_id"
  end

  create_table "order_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "order_id", null: false
    t.uuid "item_id", null: false
    t.string "item_name_snapshot", null: false
    t.integer "unit_price_cents", null: false
    t.integer "quantity", default: 1, null: false
    t.integer "subtotal_cents", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["item_id"], name: "index_order_items_on_item_id"
    t.index ["order_id"], name: "index_order_items_on_order_id"
  end

  create_table "orders", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "shop_id", null: false
    t.uuid "customer_id"
    t.string "status", default: "received", null: false
    t.string "payment_status", default: "pending", null: false
    t.integer "subtotal_cents", null: false
    t.integer "tax_cents", default: 0, null: false
    t.integer "tip_cents", default: 0, null: false
    t.integer "total_cents", null: false
    t.string "currency", null: false
    t.string "pickup_type", default: "asap", null: false
    t.uuid "pickup_slot_id"
    t.datetime "pickup_time"
    t.string "customer_name"
    t.string "customer_phone"
    t.text "special_instructions"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_orders_on_customer_id"
    t.index ["pickup_slot_id"], name: "index_orders_on_pickup_slot_id"
    t.index ["shop_id"], name: "index_orders_on_shop_id"
  end

  create_table "payments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "order_id", null: false
    t.string "stripe_payment_intent_id"
    t.string "stripe_charge_id"
    t.integer "amount_cents", null: false
    t.integer "platform_fee_cents", default: 0, null: false
    t.string "currency", null: false
    t.string "status", default: "pending", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_payments_on_order_id", unique: true
    t.index ["stripe_payment_intent_id"], name: "index_payments_on_stripe_payment_intent_id"
  end

  create_table "pickup_slots", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "shop_id", null: false
    t.date "slot_date", null: false
    t.time "start_time", null: false
    t.time "end_time", null: false
    t.integer "capacity", default: 10, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id"], name: "index_pickup_slots_on_shop_id"
  end

  create_table "shop_members", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "shop_id", null: false
    t.uuid "user_id", null: false
    t.string "role", default: "barista", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id", "user_id"], name: "index_shop_members_on_shop_id_and_user_id", unique: true
    t.index ["shop_id"], name: "index_shop_members_on_shop_id"
    t.index ["user_id"], name: "index_shop_members_on_user_id"
  end

  create_table "shop_subscriptions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "shop_id", null: false
    t.uuid "tier_id", null: false
    t.string "status", default: "active", null: false
    t.datetime "current_period_start"
    t.datetime "current_period_end"
    t.string "stripe_subscription_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id"], name: "index_shop_subscriptions_on_shop_id", unique: true
    t.index ["tier_id"], name: "index_shop_subscriptions_on_tier_id"
  end

  create_table "shops", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "slug", null: false
    t.string "name", null: false
    t.string "legal_name"
    t.string "timezone", default: "America/Mexico_City", null: false
    t.string "currency", default: "MXN", null: false
    t.string "locale", default: "es", null: false
    t.boolean "tax_included", default: true, null: false
    t.decimal "tax_rate", precision: 5, scale: 4, default: "0.0", null: false
    t.text "address"
    t.decimal "lat", precision: 10, scale: 8
    t.decimal "lng", precision: 11, scale: 8
    t.string "logo_url"
    t.string "brand_color", default: "#000000", null: false
    t.string "stripe_account_id"
    t.string "stripe_connect_status", default: "pending", null: false
    t.uuid "owner_id"
    t.string "status", default: "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["owner_id"], name: "index_shops_on_owner_id"
    t.index ["slug"], name: "index_shops_on_slug", unique: true
  end

  create_table "slot_reservations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "slot_id", null: false
    t.uuid "order_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_slot_reservations_on_order_id", unique: true
    t.index ["slot_id"], name: "index_slot_reservations_on_slot_id"
  end

  create_table "subscription_tiers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.integer "monthly_price_cents", default: 0, null: false
    t.integer "included_orders", default: 0, null: false
    t.integer "overage_per_order_cents", default: 0, null: false
    t.string "stripe_price_id"
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "role", default: "customer", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "customers", "users"
  add_foreign_key "events", "orders"
  add_foreign_key "events", "shops"
  add_foreign_key "item_modifier_links", "menu_items", column: "item_id"
  add_foreign_key "item_modifier_links", "modifier_groups", column: "group_id"
  add_foreign_key "menu_categories", "shops"
  add_foreign_key "menu_items", "menu_categories", column: "category_id"
  add_foreign_key "menu_items", "shops"
  add_foreign_key "modifier_groups", "shops"
  add_foreign_key "modifier_options", "modifier_groups", column: "group_id"
  add_foreign_key "notifications", "orders"
  add_foreign_key "notifications", "shops"
  add_foreign_key "order_item_modifiers", "modifier_options", column: "option_id"
  add_foreign_key "order_item_modifiers", "order_items"
  add_foreign_key "order_items", "menu_items", column: "item_id"
  add_foreign_key "order_items", "orders"
  add_foreign_key "orders", "customers"
  add_foreign_key "orders", "pickup_slots"
  add_foreign_key "orders", "shops"
  add_foreign_key "payments", "orders"
  add_foreign_key "pickup_slots", "shops"
  add_foreign_key "shop_members", "shops"
  add_foreign_key "shop_members", "users"
  add_foreign_key "shop_subscriptions", "shops"
  add_foreign_key "shop_subscriptions", "subscription_tiers", column: "tier_id"
  add_foreign_key "shops", "users", column: "owner_id"
  add_foreign_key "slot_reservations", "orders"
  add_foreign_key "slot_reservations", "pickup_slots", column: "slot_id"
end
