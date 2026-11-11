class CreateDailyRecords < ActiveRecord::Migration[8.1]
  def change
    create_table :daily_records do |t|
      t.references :user, null: false, foreign_key: true
      t.date :date
      t.decimal :weight
      t.decimal :fat_percentage
      t.text :memo

      t.timestamps
    end
  end
end
