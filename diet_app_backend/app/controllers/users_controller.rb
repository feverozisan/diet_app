module Api
class UsersController < ApplicationController
    # GET /me
    def me
        user = User.first # 現在はテスト用として最初のユーザーを取得

        if user
            render json: {
                id: user.id,
                email: user.email,
                height: user.height,
                age: user.age,
                gender: user.gender,
                activity_level: user.activity_level
            }, status: :ok
        else
            render json: { error: "ユーザーが見つかりません" }, status: :not_found
        end
    end

    # POST /signup
    def create
        @user = User.new(user_params)

        if @user.save
            render json: @user.as_json(except: [:password_digest]), status: :created
        else
            render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
    end

    # PATCH /me または PUT /me
    def update
        # テスト用として @current_user または User.first を使用
        user = @current_user || User.first

        if user&.update(user_params)
            render json: { id: user.id, height: user.height, age: user.age }, status: :ok
        else
            render json: { errors: user&.errors&.full_messages || ["ユーザーが見つかりません"] }, status: :unprocessable_entity
        end
    end

    private

    # ストロングパラメータ：height の許可を追加済み
    def user_params
        params.require(:user).permit(:email, :password, :password_confirmation, :height, :age, :gender, :activity_level)
    end
end
end