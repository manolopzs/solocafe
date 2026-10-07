class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.text :email, null: false
      t.text :password_digest
      t.timestamptz :created_at, null: false, default: -> { 'now()' }
      t.timestamptz :updated_at, null: false, default: -> { 'now()' }
    end

    add_index :users, :email, unique: true
  end
end
