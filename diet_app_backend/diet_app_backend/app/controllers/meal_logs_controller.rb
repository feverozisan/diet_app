module Api
class MealLogsController < ApplicationController
    before_action :authenticate_request # 認証フィルターを有効化

    def index
        date = params[:date] || Date.today
        meal_logs = @current_user.meal_logs.where(recorded_at: date)
        render json: meal_logs, status: :ok
    end

    def create
        # current_user が正常にセットされていれば動きます
        meal_log = @current_user.meal_logs.build(meal_log_params)

        if meal_log.save
            render json: meal_log, status: :created
        else
            render json: { errors: meal_log.errors.full_messages }, status: :unprocessable_entity
        end
    end

    def update
        @meal_log = MealLog.find(params[:id])
        if @meal_log.update(meal_log_params)
            render json: @meal_log
        else
            render json: @meal_log.errors, status: :unprocessable_entity
        end
    end

    def destroy
        meal_log = @current_user.meal_logs.find(params[:id])
        meal_log.destroy
        head :no_content
    end

    private

    def meal_log_params
        params.require(:meal_log).permit(:meal_type, :name, :calories, :protein, :fat, :carbs, :recorded_at)
    end
end
end