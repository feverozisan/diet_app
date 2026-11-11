class Goal < ApplicationRecord
  belongs_to :user

  validates :target_weight, presence: true, numericality: { greater_than: 0 }
end
