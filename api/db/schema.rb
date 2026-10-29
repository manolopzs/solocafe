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

ActiveRecord::Schema[8.1].define(version: 2026_10_21_130000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.uuid "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "customer_favorites", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "customer_id", null: false
    t.uuid "shop_id", null: false
    t.uuid "menu_item_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id", "shop_id", "menu_item_id"], name: "index_customer_favorites_uniqueness", unique: true
    t.index ["customer_id"], name: "index_customer_favorites_on_customer_id"
    t.index ["menu_item_id"], name: "index_customer_favorites_on_menu_item_id"
    t.index ["shop_id"], name: "index_customer_favorites_on_shop_id"
  end

  create_table "customer_payment_methods", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "customer_id", null: false
    t.string "stripe_payment_method_id", null: false
    t.string "brand"
    t.string "last4"
    t.integer "exp_month"
    t.integer "exp_year"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_customer_payment_methods_on_customer_id"
    t.index ["stripe_payment_method_id"], name: "index_customer_payment_methods_on_stripe_payment_method_id", unique: true
  end

  create_table "customers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id"
    t.string "name"
    t.string "phone"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "stripe_customer_id"
    t.index ["stripe_customer_id"], name: "index_customers_on_stripe_customer_id", unique: true
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

  create_table "loyalty_stamps", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "shop_id", null: false
    t.uuid "customer_id", null: false
    t.uuid "order_id", null: false
    t.string "status", default: "earned", null: false
    t.datetime "reversed_at"
    t.uuid "redemption_order_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_loyalty_stamps_on_customer_id"
    t.index ["order_id"], name: "index_loyalty_stamps_on_order_id", unique: true
    t.index ["redemption_order_id"], name: "index_loyalty_stamps_on_redemption_order_id"
    t.index ["shop_id", "customer_id", "status"], name: "index_loyalty_stamps_on_shop_customer_and_status"
    t.index ["shop_id"], name: "index_loyalty_stamps_on_shop_id"
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
    t.string "status", default: "pending_payment", null: false
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
    t.integer "discount_cents", default: 0, null: false
    t.boolean "loyalty_redeemed", default: false, null: false
    t.string "customer_email"
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
    t.string "stripe_account_id"
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
    t.index ["shop_id", "slot_date", "start_time"], name: "index_pickup_slots_on_shop_date_and_start", unique: true
    t.index ["shop_id"], name: "index_pickup_slots_on_shop_id"
  end

  create_table "push_devices", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "shop_id", null: false
    t.uuid "user_id"
    t.string "platform", null: false
    t.string "endpoint"
    t.string "p256dh"
    t.string "auth_key"
    t.string "token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "audience", default: "kitchen", null: false
    t.uuid "order_id"
    t.index ["audience", "order_id"], name: "index_push_devices_on_audience_and_order_id"
    t.index ["order_id"], name: "index_push_devices_on_order_id"
    t.index ["shop_id", "endpoint"], name: "index_push_devices_on_shop_and_endpoint", unique: true, where: "(endpoint IS NOT NULL)"
    t.index ["shop_id", "token"], name: "index_push_devices_on_shop_and_token", unique: true, where: "(token IS NOT NULL)"
    t.index ["shop_id"], name: "index_push_devices_on_shop_id"
    t.index ["user_id"], name: "index_push_devices_on_user_id"
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
    t.string "timezone", default: "Europe/Madrid", null: false
    t.string "currency", default: "EUR", null: false
    t.string "locale", default: "es", null: false
    t.boolean "tax_included", default: true, null: false
    t.decimal "tax_rate", precision: 5, scale: 4, default: "0.0", null: false
    t.text "address"
    t.decimal "lat", precision: 10, scale: 8
    t.decimal "lng", precision: 11, scale: 8
    t.string "logo_url"
    t.string "brand_color", default: "#8c3d25", null: false
    t.string "stripe_account_id"
    t.string "stripe_connect_status", default: "pending", null: false
    t.jsonb "operating_hours", default: {}
    t.integer "slot_duration_minutes", default: 15, null: false
    t.integer "prep_time_buffer_minutes", default: 10, null: false
    t.integer "max_days_ahead", default: 7, null: false
    t.uuid "owner_id"
    t.string "status", default: "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "slot_capacity", default: 10, null: false
    t.boolean "accepting_pickup", default: true, null: false
    t.string "display_font", default: "dm_sans", null: false
    t.integer "loyalty_stamps_required", default: 10, null: false
    t.string "loyalty_reward_text", default: "Un artículo gratis", null: false
    t.boolean "test_shop", default: false, null: false
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

  create_table "solid_queue_batch_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.bigint "batch_id", null: false
    t.datetime "created_at", null: false
    t.index ["batch_id"], name: "index_solid_queue_batch_executions_on_batch_id"
    t.index ["job_id"], name: "index_solid_queue_batch_executions_on_job_id", unique: true
  end

  create_table "solid_queue_batches", force: :cascade do |t|
    t.string "active_job_batch_id"
    t.string "description"
    t.text "on_finish"
    t.text "on_success"
    t.text "on_failure"
    t.text "metadata"
    t.integer "total_jobs", default: 0, null: false
    t.integer "completed_jobs", default: 0, null: false
    t.integer "failed_jobs", default: 0, null: false
    t.datetime "enqueued_at"
    t.datetime "finished_at"
    t.datetime "failed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active_job_batch_id"], name: "index_solid_queue_batches_on_active_job_batch_id", unique: true
    t.index ["finished_at"], name: "index_solid_queue_batches_on_finished_at"
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.string "concurrency_key", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.text "error"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "queue_name", null: false
    t.string "class_name", null: false
    t.text "arguments"
    t.integer "priority", default: 0, null: false
    t.string "active_job_id"
    t.datetime "scheduled_at"
    t.datetime "finished_at"
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "batch_id"
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["batch_id"], name: "index_solid_queue_jobs_on_batch_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.string "queue_name", null: false
    t.datetime "created_at", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.bigint "supervisor_id"
    t.integer "pid", null: false
    t.string "hostname"
    t.text "metadata"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "task_key", null: false
    t.datetime "run_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.string "key", null: false
    t.string "schedule", null: false
    t.string "command", limit: 2048
    t.string "class_name"
    t.text "arguments"
    t.string "queue_name"
    t.integer "priority", default: 0
    t.boolean "static", default: true, null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "scheduled_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.string "key", null: false
    t.integer "value", default: 1, null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "stripe_webhook_events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "stripe_event_id", null: false
    t.string "event_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["stripe_event_id"], name: "index_stripe_webhook_events_on_stripe_event_id", unique: true
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

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "customer_favorites", "customers"
  add_foreign_key "customer_favorites", "menu_items"
  add_foreign_key "customer_favorites", "shops"
  add_foreign_key "customer_payment_methods", "customers"
  add_foreign_key "customers", "users"
  add_foreign_key "events", "orders"
  add_foreign_key "events", "shops"
  add_foreign_key "item_modifier_links", "menu_items", column: "item_id"
  add_foreign_key "item_modifier_links", "modifier_groups", column: "group_id"
  add_foreign_key "loyalty_stamps", "customers"
  add_foreign_key "loyalty_stamps", "orders"
  add_foreign_key "loyalty_stamps", "orders", column: "redemption_order_id"
  add_foreign_key "loyalty_stamps", "shops"
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
  add_foreign_key "push_devices", "orders"
  add_foreign_key "push_devices", "shops"
  add_foreign_key "push_devices", "users"
  add_foreign_key "shop_members", "shops"
  add_foreign_key "shop_members", "users"
  add_foreign_key "shop_subscriptions", "shops"
  add_foreign_key "shop_subscriptions", "subscription_tiers", column: "tier_id"
  add_foreign_key "shops", "users", column: "owner_id"
  add_foreign_key "slot_reservations", "orders"
  add_foreign_key "slot_reservations", "pickup_slots", column: "slot_id"
  add_foreign_key "solid_queue_batch_executions", "solid_queue_batches", column: "batch_id", on_delete: :cascade
  add_foreign_key "solid_queue_batch_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
end
