module Api
    module V1
        class DailyRecordsController < ApplicationController
        before_action :authenticate_user! # トークン認証を行っている前提

        # 一覧取得（日付順）
        def index
            records = current_user.daily_records.order(date: :desc)
            render json: records, status: :ok
        end

        # 新規記録登録・既存日付の更新
        def create
            # すでに同じ日付の記録があれば更新、なければ新規作成
            record = current_user.daily_records.find_or_initialize_by(date: record_params[:date])

            if record.update(record_params)
                render json: record, status: :ok
            else
                render json: { errors: record.errors.full_messages }, status: :unprocessable_entity
            end
        end

        private

            def record_params
                params.require(:daily_record).permit(:date, :weight, :fat_percentage, :memo)
            end
        end
    end
end