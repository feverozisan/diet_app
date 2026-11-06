class CreateGoals < ActiveRecord::Migration[8.1]
  def change
    create_table :goals do |t|
      t.references :user, null: false, foreign_key: true
      t.decimal :target_weight
      t.text :memo

      t.timestamps
    end
  end
end
