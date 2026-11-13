require 'rails_helper'

RSpec.describe "Api::MealLogs", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/api/meal_logs/index"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /create" do
    it "returns http success" do
      get "/api/meal_logs/create"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /destroy" do
    it "returns http success" do
      get "/api/meal_logs/destroy"
      expect(response).to have_http_status(:success)
    end
  end

end
