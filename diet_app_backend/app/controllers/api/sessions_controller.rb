module Api
    class SessionsController < ApplicationController
        def create
            user = User.find_by(username: params[:session][:username])

            if user && user.authenticate(params[:session][:password])
                # JWTトークンの生成（既存の認証機構に合わせて調整してください）
                token = JWT.encode({ user_id: user.id, exp: 24.hours.from_now.to_i }, Rails.application.secret_key_base)

                # クッキーにトークンをセット（SameSite/Secureを本番向けに設定）
                cookies[:jwt] = {
                    value: token,
                    httponly: true,
                    secure: Rails.env.production?,
                    same_site: :lax,
                    expires: 24.hours.from_now
                }

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