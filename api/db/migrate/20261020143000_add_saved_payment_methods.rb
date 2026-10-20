class AddSavedPaymentMethods < ActiveRecord::Migration[8.1]
  def change
    add_column :customers, :stripe_customer_id, :string
    add_index :customers, :stripe_customer_id, unique: true

    add_column :payments, :stripe_account_id, :string

    create_table :customer_payment_methods, id: :uuid do |t|
      t.references :customer, null: false, foreign_key: true, type: :uuid
      t.string :stripe_payment_method_id, null: false
      t.string :brand
      t.string :last4
      t.integer :exp_month
      t.integer :exp_year
      t.timestamps
    end

    add_index :customer_payment_methods, :stripe_payment_method_id, unique: true
  end
end
