# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
    def authenticate_request
        # Authorization ヘッダーから "Bearer <TOKEN>" を取得
        header = request.headers['Authorization']
        token = header.split(' ').last if header.present?

        if token.present?
            begin
                # トークンをデコードしてユーザーを取得
                decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
                @current_user = User.find(decoded['user_id'])
            rescue ActiveRecord::RecordNotFound, JWT::DecodeError, JWT::ExpiredSignature
                render json: { errors: ['Unauthorized'] }, status: :unauthorized
            end
        else
            render json: { errors: ['Unauthorized'] }, status: :unauthorized
        end
    end

    skip_forgery_protection
end