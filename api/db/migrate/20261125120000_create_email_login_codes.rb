class CreateEmailLoginCodes < ActiveRecord::Migration[8.1]
  def change
    create_table :email_login_codes do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, type: :uuid, index: false
      t.string :code_digest, null: false
      t.datetime :expires_at, null: false
      t.integer :attempts, null: false, default: 0
      t.datetime :consumed_at
      t.timestamps
    end

    add_index :email_login_codes, [:user_id, :created_at]
    add_index :email_login_codes, :expires_at
  end
end
