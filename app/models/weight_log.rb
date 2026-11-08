class WeightLog < ApplicationRecord
  belongs_to :user

  validates :weight, presence: true
  validates :recorded_at, presence: true
end