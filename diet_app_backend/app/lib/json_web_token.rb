# app/lib/json_web_token.rb
class JsonWebToken
    SECRET_KEY = Rails.application.secret_key_base

    # トークン発行（有効期限などを指定）
    def self.encode(payload, exp = 24.hours.from_now)
        payload[:exp] = exp.to_i
        JWT.encode(payload, SECRET_KEY)
    end

    # トークン検証・デコード
    def self.decode(token)
        decoded = JWT.decode(token, SECRET_KEY)[0]
        HashWithIndifferentAccess.new decoded
    rescue
        nil
    end
end