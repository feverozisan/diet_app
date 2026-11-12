class ApplicationController < ActionController::API
    include ActionController::Cookies # 👈 Cookie を扱えるようにするために必要

    def authenticate_request
        # 1. まず Authorization ヘッダーからトークンを探す
        header = request.headers['Authorization']
        token = header.split(' ').last if header.present?

        # 2. ヘッダーに見つからない場合、Cookie (cookies[:jwt]) から探す
        token = cookies[:jwt] if token.blank? || token == "undefined"

        if token.blank? || token == "undefined"
            render json: { error: 'Not Authorized (No Token)' }, status: :unauthorized
            return
        end

        begin
            decoded = JsonWebToken.decode(token)
            if decoded.present? && decoded[:user_id].present?
                @current_user = User.find(decoded[:user_id])
            else
                render json: { error: 'Not Authorized (Invalid Payload)' }, status: :unauthorized
            end
        rescue ActiveRecord::RecordNotFound, JWT::DecodeError => e
            render json: { error: 'Not Authorized (Invalid Token)' }, status: :unauthorized
        end
    end

    def fallback_index_html
        render file: Rails.root.join('public', 'index.html'), layout: false
    end
end