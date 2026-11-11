class ChangeWeightToBeDecimalInWeightLogs < ActiveRecord::Migration[8.0] # ※バージョン指定は既存ファイルに合わせてください
  def change
    change_column :weight_logs, :weight, :decimal, precision: 5, scale: 2
  end
end