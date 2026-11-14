module Api
    class UsersController < ApplicationController
        # GET /api/me
        def me
            user = @current_user || User.first

            if user
                render json: user_response(user), status: :ok
            else
                render json: { error: "ユーザーが見つかりません" }, status: :not_found
            end
        end

        # PATCH /api/me
        def update
            user = @current_user || User.first

            if user&.update(user_params)
                # 更新後も全情報を返却する
                render json: user_response(user), status: :ok
            else
                render json: { errors: user&.errors&.full_messages || ["ユーザーが見つかりません"] }, status: :unprocessable_entity
            end
        end

        def create
            user = User.new(user_params)
            if user.save
                # 登録成功時のレスポンス（例: ユーザー情報を返す）
                render json: { status: 'SUCCESS', data: user }, status: :created
            else
                # 失敗時のレスポンス（エラーメッセージを返す）
                render json: { status: 'ERROR', data: user.errors }, status: :unprocessable_entity
            end
        end

        private

        # ユーザー情報を整形して返すヘルパーメソッド
        def user_response(user)
        {
            id: user.id,
            username: user.username,
            email: user.email,
            height: user.height,
            target_weight: user.target_weight,
            age: user.age,
            gender: user.gender,
            activity_level: user.activity_level
        }
        end

        def user_params
            # password と password_confirmation を許可するリストに追加する
            params.require(:user).permit(
                :username,
                :email,
                :password,               # ← 追加
                :password_confirmation,  # ← 追加
                :height,
                :target_weight,
                :age,
                :gender,
                :activity_level
            )
        end
    end
end