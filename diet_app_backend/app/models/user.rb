class User < ApplicationRecord
    has_secure_password

    has_many :weight_logs, dependent: :destroy
    has_one :goal, dependent: :destroy
    has_many :daily_records, dependent: :destroy
    has_many :weights, dependent: :destroy
    has_many :meal_logs, dependent: :destroy

    # email は必須（presence: true）を外し、入力されている場合のみ一意性をチェックするようにする
    validates :email, uniqueness: true, allow_nil: true, allow_blank: true
    validates :target_weight, numericality: { greater_than: 0 }, allow_nil: true
end