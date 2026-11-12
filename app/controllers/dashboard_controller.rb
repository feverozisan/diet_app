module Api
  class DashboardController < ApplicationController
    before_action :authenticate_request

    def index
      # 最新の体重ログを取得
      latest_log = @current_user.weight_logs.order(recorded_at: :desc).first

      # 目標設定を取得
      goal = @current_user.goal

      # 最新体重と目標体重の差分の計算
      weight_difference = if latest_log && goal
                              (latest_log.weight - goal.target_weight).round(2)
                          end

      # 過去30日のログを取得
      recent_logs = @current_user.weight_logs
                                  .where("recorded_at >= ?", 30.days.ago.to_date)
                                  .order(recorded_at: :asc)

      # JSON でレスポンスを返却
      render json: {
        latest_weight: latest_log&.weight,
        latest_date: latest_log&.recorded_at,
        target_weight: goal&.target_weight,
        difference_to_goal: weight_difference,
        recent_logs: recent_logs,
        height: @current_user.height,
        age: @current_user.age,
        gender: @current_user.gender,
        activity_level: @current_user.activity_level
      }
    end
  end
end