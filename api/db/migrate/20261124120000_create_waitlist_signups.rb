class CreateWaitlistSignups < ActiveRecord::Migration[8.1]
  def change
    create_table :waitlist_signups do |t|
      t.string :email, null: false
      t.string :source, null: false, default: "landing"
      t.timestamps

      t.index :email, unique: true
    end
  end
end
