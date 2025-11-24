class AddConclusionDateToTasks < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :conclusion_date, :date
  end
end

