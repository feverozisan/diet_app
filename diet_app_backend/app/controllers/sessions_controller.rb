class SessionsController < ApplicationController
    def create
        user = User.find_by(email: params[:email])

        if user&.authenticate(params[:password])
            token = JsonWebToken.encode(user_id: user.id)

        # 🔐 セキュアなCookieとしてトークンを発行する設定
        cookies[:jwt] = {
            value: token,
            httponly: true, # JavaScriptからの読み取りをブロック（XSS攻撃対策）
            secure: Rails.env.production?, # 本番環境(AWS)ではHTTPS通信時のみ送信を許可
            same_site: Rails.env.production? ? :none : :lax, # フロントエンドとバックエンドのドメインが異なる場合の設定
            expires: 24.hours.from_now
        }

        render json: {
            message: 'ログイン成功',
            user: { id: user.id, email: user.email } # トークンはJSONから外し、ユーザー情報のみ返す
        }, status: :ok
        else
            render json: { error: "メールアドレスまたはパスワードが正しくありません" }, status: :unauthorized
        end
    end

    def destroy
        cookies.delete(:jwt)
        render json: { message: "ログアウトしました" }, status: :ok
    end
end