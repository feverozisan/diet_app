class AuthController < ApplicationController
    #POST /login
    def login
        user = User.find_by(email: params[:email])
        if user&.authenticate(params[:password])
            token = JsonWebToken.encode(user_id: user.id)
            cookies.signed[:jwt] = {
                value: token,
                httponly: true, # JSからのアクセスを防止 (XSS対策)
                secure: Rails.env.production?, # 本番環境(HTTPS)のみ送信
                same_site: :lax, # CSRF対策
                expires: 24.hours.from_now
            }
        else
            render json: { error: 'メールアドレスまたはパスワードが正しくありません' }, status: :unauthorized
        end
    end

    # ログアウト処理
    def destroy
        # 1. jwt Cookieを削除する
        cookies.delete(:jwt)

        # 2. ログアウト成功メッセージを返す
        render json: { message: "Logged out successfully" }, status: :ok
    end
end
