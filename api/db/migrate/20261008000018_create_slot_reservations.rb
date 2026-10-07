class CreateSlotReservations < ActiveRecord::Migration[8.1]
  def change
    create_table :slot_reservations, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :slot, type: :uuid, null: false, foreign_key: { to_table: :pickup_slots, on_delete: :cascade }
      t.references :order, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end

    add_index :slot_reservations, :order_id, unique: true
  end
end
