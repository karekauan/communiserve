class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.references :task_request, null: false, foreign_key: true
      t.string :name, null: false
      t.string :street, null: false
      t.string :number, null: false
      t.string :neighborhood, null: false
      t.string :city, null: false
      t.string :state, null: false
      t.string :zipcode, null: false
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
      t.references :worker, null: true, foreign_key: { to_table: :users }
      t.references :admin, null: false, foreign_key: { to_table: :users }
      t.string :status, default: 'in_progress', null: false
      t.date :limit_end_date
      t.date :initial_date

      t.timestamps
    end
  end
end
