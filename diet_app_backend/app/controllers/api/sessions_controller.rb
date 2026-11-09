# app/controllers/api/sessions_controller.rb
module Api
    class SessionsController < ApplicationController
        def create
            user = User.find_by(username: params[:session][:username])

            if user && user.authenticate(params[:session][:password])
                # ログイン成功時に、ユーザーのプロフィール情報も一緒に返す
                render json: {
                    message: "ログインに成功しました",
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        height: user.height,
                        target_weight: user.target_weight,
                        age: user.age,
                        gender: user.gender,
                        activity_level: user.activity_level
                    }
                }, status: :ok
            else
                render json: { error: "認証に失敗しました" }, status: :unauthorized
            end
        end

        def destroy
            cookies.delete(:jwt)
            render json: { message: "ログアウトしました" }, status: :ok
        end
    end
end