module Api
    class SessionsController < ApplicationController
        include ActionController::Cookies

        def create
            # sessionキーの有無に関わらず安全に取得できるようにする
            username = params[:session] ? params[:session][:username] : params[:username]
            password = params[:session] ? params[:session][:password] : params[:password]

            user = User.find_by(username: username)

            if user && user.authenticate(password)
                token = JWT.encode({ user_id: user.id, exp: 24.hours.from_now.to_i }, Rails.application.secret_key_base)

                cookies[:jwt] = {
                    value: token,
                    httponly: true,
                    secure: Rails.env.production?,
                    same_site: :lax,
                    expires: 24.hours.from_now
                }

                render json: {
                    message: "ログインに成功しました",
                    token: token,
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
                render json: { error: "ユーザー名またはパスワードが正しくありません" }, status: :unauthorized
            end
        end

        def destroy
            cookies.delete(:jwt)
            render json: { message: "ログアウトしました" }, status: :ok
        end
    end
end