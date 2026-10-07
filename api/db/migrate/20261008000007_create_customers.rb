class CreateCustomers < ActiveRecord::Migration[8.1]
  def change
    create_table :customers, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.references :user, type: :uuid, foreign_key: { on_delete: :nullify }
      t.text :name
      t.text :phone
      t.text :email
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
    end
  end
end
