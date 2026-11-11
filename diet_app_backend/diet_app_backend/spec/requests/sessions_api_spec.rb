# spec/models/weight_log_spec.rb
require 'rails_helper'

RSpec.describe WeightLog, type: :model do
  describe 'バリデーションのテスト' do
    # テスト用のユーザーを事前に用意
    let(:user) { User.create!(email: 'test@example.com', password: 'password123') }

    it '体重と記録日があれば有効であること' do
      weight_log = WeightLog.new(weight: 60.5, recorded_at: '2026-10-15', user: user)
      expect(weight_log).to be_valid
    end

    it '体重がなければ無効であること' do
      weight_log = WeightLog.new(weight: nil, recorded_at: '2026-10-15', user: user)
      expect(weight_log).not_to be_valid
    end
  end
end