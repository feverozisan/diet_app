module Api
  class GoalsController < ApplicationController
    before_action :authenticate_request
    before_action :set_goal, only: [:show, :update]

    # GET /api/goal
    def show
      goal = @current_user.goal
      if goal
        render json: goal
      else
        render json: { message: "Goal not set yet" }, status: :ok
      end
    end

    # POST /api/goal
    def create
      goal = @current_user.build_goal(goal_params)

      if goal.save
        render json: goal, status: :created
      else
        render json: { errors: goal.errors.full_messages }, status: :unprocessable_entity
      end
    end

# PUT/PATCH /api/goal
    def update
      # ユーザーの既存の goal を取得するか、なければ新しくビルドする
      goal = @current_user.goal || @current_user.build_goal

      # パスワードと同様に、送られてきたパラメータを割り当てて保存する
      if goal.update(goal_params)
        render json: goal, status: :ok
      else
        render json: { errors: goal.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def set_goal
      @goal = @current_user.goal
    end

    def goal_params
      params.require(:goal).permit(:target_weight, :memo)
    end
  end
end