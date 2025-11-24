class CreateTaskRequests < ActiveRecord::Migration[8.1]
  def change
    create_table :task_requests do |t|
      t.references :citizen, null: false, foreign_key: { to_table: :users }
      t.string :name, null: false
      t.string :street, null: false
      t.string :number, null: false
      t.string :neighborhood, null: false
      t.string :city, null: false
      t.string :state, null: false
      t.string :zipcode, null: false
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
      t.string :status, default: 'pending', null: false
      t.references :admin, null: true, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
