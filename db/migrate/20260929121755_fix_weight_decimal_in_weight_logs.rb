class FixWeightDecimalInWeightLogs < ActiveRecord::Migration[8.0]
  def change
    change_column :weight_logs, :weight, :decimal, precision: 5, scale: 2
  end
end