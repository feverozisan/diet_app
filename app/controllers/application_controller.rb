class ApplicationController < ActionController::API
    def authenticate_request
        header = request.headers['Authorization']
        token = header.split(' ').last if header.present?

        if token.blank? || token == "undefined"
            render json: { error: 'Not Authorized (No Token)' }, status: :unauthorized
            return
        end

        begin
            decoded = JsonWebToken.decode(token)
            # decoded が nil またはハッシュ以外の場合のガード
            if decoded.present? && decoded[:user_id].present?
                @current_user = User.find(decoded[:user_id])
            else
                render json: { error: 'Not Authorized (Invalid Payload)' }, status: :unauthorized
            end
        rescue ActiveRecord::RecordNotFound, JWT::DecodeError => e
            render json: { error: 'Not Authorized (Invalid Token)' }, status: :unauthorized
        end
    end
end