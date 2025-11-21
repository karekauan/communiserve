class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.date :birthday, null: false
      t.string :email, null: false
      t.string :phone, null: false
      t.string :cpf, null: false
      t.string :password_digest, null: false
      t.string :role, default: "citizen", null: false

      t.timestamps
    end
    
    add_index :users, :cpf, unique: true
    add_index :users, :email, unique: true
  end
end
