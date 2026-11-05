class CreateWeights < ActiveRecord::Migration[8.1]
  def change
    create_table :weights do |t|
      t.references :user, null: false, foreign_key: true
      t.decimal :weight
      t.date :recorded_at

      t.timestamps
    end
  end
end
