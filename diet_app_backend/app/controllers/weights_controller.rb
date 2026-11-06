class WeightsController < ApplicationController
    # GET /weights
    def index
        user = User.first # ※テスト用
        weights = user.weights.order(recorded_at: :desc)
        render json: weights
    end

    # POST /weights
    def create
        user = User.first # ※テスト用
        weight = user.weights.build(weight_params)

        if weight.save
            render json: weight, status: :created
        else
            render json: { errors: weight.errors.full_messages }, status: :unprocessable_entity
        end
    end

    private

    def weight_params
        params.require(:weight).permit(:weight, :recorded_at)
    end
end