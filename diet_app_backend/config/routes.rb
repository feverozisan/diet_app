Rails.application.routes.draw do
  get "dashboard/index"
  get "up" => "rails/health#show", as: :rails_health_check

  post "signup" => "users#create"
  post "login" => "sessions#create"
  delete "logout" => "sessions#destroy"

  # ⚖️ 体重記録（WeightLog）
  resources :weight_logs, only: [:index, :create, :destroy, :update]

  # 例: PATCH /me でユーザー情報を更新できるようにする場合
  patch '/me', to: 'users#update'

  # 📊 ダッシュボード（まとめてデータ取得する場合）
  get 'dashboard', to: 'dashboard#index' # ※ダッシュボード用コントローラーがある場合
  resource :goal, only: [:show, :create, :update]
  resources :daily_records, only: [:index, :create, :update, :destroy]
  resources :meal_logs, only: [:index, :create, :destroy, :update]
end