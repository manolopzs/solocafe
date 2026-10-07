class CreatePickupSlots < ActiveRecord::Migration[8.1]
  def change
    create_table :pickup_slots, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :shop, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.date :slot_date, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.integer :capacity, null: false, default: 10
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end
  end
end
