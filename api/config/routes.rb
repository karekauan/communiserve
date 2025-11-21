Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Authentication routes
  post "auth/check_cpf", to: "auth#check_cpf"
  post "auth/login", to: "auth#login"
  post "auth/register", to: "auth#register"
  get "auth/profile", to: "auth#profile"
  put "auth/profile", to: "auth#update_profile"
  patch "auth/profile", to: "auth#update_profile"
  
  # Users management routes (admin only)
  get "users", to: "users#index"
  get "users/:id", to: "users#show"
  put "users/:id", to: "users#update"
  patch "users/:id", to: "users#update"
  post "users/create_worker", to: "users#create_worker"
  get "users/skills/list", to: "users#skills"
end
