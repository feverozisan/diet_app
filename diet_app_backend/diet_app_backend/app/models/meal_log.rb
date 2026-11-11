# app/models/meal_log.rb
class MealLog < ApplicationRecord
    belongs_to :user

    validates :name, presence: true
    validates :recorded_at, presence: true
end