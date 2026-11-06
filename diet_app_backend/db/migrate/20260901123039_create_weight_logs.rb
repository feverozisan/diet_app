class CreateWeightLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :weight_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.decimal :weight
      t.date :recorded_at
      t.text :memo

      t.timestamps
    end
  end
end
