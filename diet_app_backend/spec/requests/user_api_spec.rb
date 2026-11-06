# spec/requests/user_api_spec.rb
require 'rails_helper'

RSpec.describe 'Users API', type: :request do
  describe 'POST /signup (ユーザー登録)' do
    
    context '有効なパラメータを送信した場合' do
      # 修正：user キーでパラメータを包む
      let(:valid_params) { { user: { email: 'newuser@example.com', password: 'password123' } } }

      it '新しいユーザーが作成され、ステータス200または201が返ること' do
        post '/signup', params: valid_params, as: :json

        expect(response).to have_http_status(:success)
        expect(User.count).to eq(1)
      end
    end

    context '無効なパラメータを送信した場合' do
      # 無効な場合も同様に user キーで包む（または実際のアプリの仕様に合わせて調整）
      let(:invalid_params) { { user: { email: '', password: 'password123' } } }

      it 'ユーザーが作成されず、エラーが返ること' do
        post '/signup', params: invalid_params, as: :json

        expect(response).to have_http_status(:unprocessable_content).or have_http_status(:bad_request)
        expect(User.count).to eq(0)
      end
    end

  end
end