# spec/models/weight_log_spec.rb
require 'rails_helper'

RSpec.describe WeightLog, type: :model do
  describe 'バリデーションのテスト' do
    
    # 観点：必須項目が揃っている場合
    it '体重と記録日があれば有効であること' do
      # 事前に紐づくユーザーを作成しておく（必要に応じてアソシエーションに合わせて調整してください）
      user = User.create!(email: 'test@example.com', password: 'password123')
      
      weight_log = WeightLog.new(
        weight: 60.5,
        recorded_at: '2026-10-14',
        user: user
      )
      expect(weight_log).to be_valid
    end

    # 観点：体重が空の場合
    it '体重がなければ無効であること' do
      weight_log = WeightLog.new(weight: nil, recorded_at: '2026-10-14')
      expect(weight_log).not_to be_valid
    end

    # 観点：記録日が空の場合
    it '記録日がなければ無効であること' do
      weight_log = WeightLog.new(weight: 60.5, recorded_at: nil)
      expect(weight_log).not_to be_valid
    end

  end
end