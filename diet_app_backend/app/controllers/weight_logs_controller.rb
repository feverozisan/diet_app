# app/controllers/weight_logs_controller.rb
class WeightLogsController < ApplicationController
    before_action :authenticate_request
    before_action :set_weight_log, only: [:show, :update, :destroy] # 👈 :update も追加！

    # GET /weight_logs
    def index
        @weight_logs = @current_user.weight_logs.order(recorded_at: :desc)
        render json: @weight_logs
    end

    # GET /weight_logs/:id
    def show
        render json: @weight_log
    end

    # POST /weight_logs
    def create
        @weight_log = @current_user.weight_logs.find_or_initialize_by(
            recorded_at: weight_log_params[:recorded_at]
        )

        if @weight_log.update(weight_log_params)
            render json: @weight_log, status: :ok
        else
            render json: { errors: @weight_log.errors.full_messages }, status: :unprocessable_entity
        end
    end

    # PUT/PATCH /weight_logs/:id
    def update
        # before_action で見つかった @weight_log をそのまま更新
        if @weight_log.update(weight_log_params)
            render json: @weight_log, status: :ok
        else
            render json: { errors: @weight_log.errors.full_messages }, status: :unprocessable_entity
        end
    end

    # DELETE /weight_logs/:id
    def destroy
        @weight_log.destroy
        render json: { message: "削除しました" }, status: :ok
    end

    private

    # 共通のデータ取得処理（他人のデータにアクセスできないよう @current_user から検索）
    def set_weight_log
        @weight_log = @current_user.weight_logs.find_by(id: params[:id])
        render json: { errors: ['Record not found'] }, status: :not_found unless @weight_log
    end

    def weight_log_params
        params.require(:weight_log).permit(:weight, :recorded_at, :memo)
    end
end