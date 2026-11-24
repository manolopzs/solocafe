class CreateWaitlistSignups < ActiveRecord::Migration[8.1]
  def change
    create_table :waitlist_signups do |t|
      # Stored lowercased by the model; the unique index makes repeat sign-ups a no-op.
      t.string :email, null: false
      t.string :source, null: false, default: "landing"
      t.timestamps
    end

    add_index :waitlist_signups, :email, unique: true
  end
end
