class AddGenderAndActivityLevelToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :gender, :string
    add_column :users, :activity_level, :string
  end
end
