Rails.application.routes.draw do
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
end