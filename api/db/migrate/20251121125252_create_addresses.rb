class CreateAddresses < ActiveRecord::Migration[8.1]
  def change
    create_table :addresses do |t|
      t.references :user, null: false, foreign_key: true
      t.string :street, null: false
      t.string :number, null: false
      t.string :neighborhood, null: false
      t.string :city, null: false
      t.string :state, null: false
      t.string :zipcode, null: false

      t.timestamps
    end
  end
end
