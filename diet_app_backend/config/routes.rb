Rails.application.routes.draw do
  root "dashboard#index"

  get "dashboard/index"
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    post "signup" => "users#create"
    post "login" => "sessions#create"
    delete "logout" => "sessions#destroy"

    resources :weight_logs, only: [:index, :create, :destroy, :update]
    patch '/me', to: 'users#update'
    get 'dashboard', to: 'dashboard#index'
    resource :goal, only: [:show, :create, :update]
    resources :daily_records, only: [:index, :create, :update, :destroy]
    resources :meal_logs, only: [:index, :create, :destroy, :update]
    resources :users, only: [:create]
  end

  # API 以外のリクエストはすべてフロントエンド（index.html）へ流す
  get '*path', to: 'application#fallback_index_html', constraints: ->(request) do
    !request.xhr? && request.format.html?
  end
end
