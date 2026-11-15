class ApplicationController < ActionController::API
    attr_reader :current_user

    def fallback_index_html
        render file: Rails.root.join('public', 'index.html'), layout: false
    end

    private

    def authenticate_request
        # 例: ログイン中のユーザーを特定する処理
        # （もしセッションや既存のログイン機構がある場合はそれに合わせて書き換えてください）
        @current_user ||= User.first # ※まずは動作確認用として最初のユーザーを割り当てる例

        unless @current_user
            render json: { error: '認証が必要です' }, status: :unauthorized
        end
    end
end