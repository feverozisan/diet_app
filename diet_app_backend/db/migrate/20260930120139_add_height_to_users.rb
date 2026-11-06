class AddHeightToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :height, :decimal
  end
end
