class User < ApplicationRecord
    has_secure_password

    has_many :weight_logs, dependent: :destroy
    has_one :goal, dependent: :destroy
    has_one :target, dependent: :destroy
    has_many :daily_records, dependent: :destroy
    has_secure_password
    has_many :weights, dependent: :destroy
    has_many :meal_logs, dependent: :destroy

    validates :email, presence: true, uniqueness: true
    validates :target_weight, numericality: { greater_than: 0 }, allow_nil: true
end