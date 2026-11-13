module Api
    class WeightLogsController < ApplicationController
        before_action :authenticate_request

        # GET /api/weight_logs
        def index
            logs = @current_user.weight_logs.order(recorded_at: :desc)
            render json: logs
        end

        # POST /api/weight_logs
        def create
            log = @current_user.weight_logs.build(weight_log_params)
            if log.save
                render json: log, status: :created
            else
                render json: { errors: log.errors.full_messages }, status: :unprocessable_entity
            end
        end

        # PATCH/PUT /api/weight_logs/:id  ← ここを追加！
        def update
            log = @current_user.weight_logs.find(params[:id])
            if log.update(weight_log_params)
                render json: log
            else
                render json: { errors: log.errors.full_messages }, status: :unprocessable_entity
            end
        end

        # DELETE /api/weight_logs/:id
        def destroy
            log = @current_user.weight_logs.find(params[:id])
            log.destroy
            render json: { message: "Weight log deleted successfully" }
        end

        private

        def weight_log_params
            params.require(:weight_log).permit(:weight, :recorded_at, :memo)
        end
    end
end