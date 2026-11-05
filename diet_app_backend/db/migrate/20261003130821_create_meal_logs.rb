class CreateMealLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :meal_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.string :meal_type
      t.string :name
      t.integer :calories
      t.float :protein
      t.float :fat
      t.float :carbs
      t.date :recorded_at

      t.timestamps
    end
  end
end
