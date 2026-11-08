class SessionsController < ApplicationController
    def create
        user = User.find_by(email: params[:email]) || User.find_by(username: params[:username])

        if user&.authenticate(params[:password])
            token = JsonWebToken.encode(user_id: user.id)
            # 👇 確実に token を JSON として返す
            render json: {
                token: token,
                user: { id: user.id, username: user.username }
            }, status: :ok
        else
            render json: { error: 'Invalid username or password' }, status: :unauthorized
        end
    end

    def destroy
        cookies.delete(:jwt)
        render json: { message: "ログアウトしました" }, status: :ok
    end
end