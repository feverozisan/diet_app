class AuthController < ApplicationController
    # POST /login
    def login
        user = User.find_by(email: params[:email]) || User.find_by(username: params[:username])

        if user&.authenticate(params[:password])
            token = JsonWebToken.encode(user_id: user.id)

            # JSON ボディで token を返却する（フロントエンドの localStorage 保存に合わせる）
            render json: {
                token: token,
                user: { id: user.id, email: user.email, username: user.username }
            }, status: :ok
        else
            render json: { error: 'ユーザー名/メールアドレスまたはパスワードが正しくありません' }, status: :unauthorized
        end
    end

    # ログアウト処理
    def destroy
        # フロントエンド側で localStorage.removeItem('token') するため、メッセージのみ返却
        render json: { message: "Logged out successfully" }, status: :ok
    end
end