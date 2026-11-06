# app/controllers/goals_controller.rb
class GoalsController < ApplicationController
    before_action :authenticate_request
    before_action :set_goal, only: [:show, :update]

    # GET /goal
    def show
        if goal
            user = User.first # ※テスト用（認証実装済みの場合は @current_user）
            goal = user.goal
            render json: goal
        else
            render json: { message: "Goal not set yet" }, status: :ok
        end
    end

    # POST /goal
    def create
        user = User.first
        goal = user.build_goal(goal_params)

        if goal.save
            render json: goal, status: :created
        else
            render json: { errors: goal.errors.full_messages }, status: :unprocessable_entity
        end
    end

    # PUT/PATCH /goal
    def update
        user = User.first
        goal = user.goal

        if goal&.update(goal_params)
            render json: goal
        else
            render json: { errors: goal&.errors&.full_messages || ['Goal not found'] }, status: :unprocessable_entity
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