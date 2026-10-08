Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  post "/auth/signup", to: "authentication#signup"
  post "/auth/login", to: "authentication#login"
  get "/auth/me", to: "authentication#me"

  resources :shops, only: [:index, :create, :update]
  get "/shops/:slug", to: "shops#show"

  scope "/shops/:shop_id", as: :shop do
    resources :menu_categories, only: [:index, :create, :update, :destroy]
    resources :menu_items, only: [:index, :create, :update, :destroy]
    resources :modifier_groups, only: [:index, :create, :update, :destroy] do
      resources :modifier_options, only: [:index, :create, :update, :destroy]
    end
    resources :orders, only: [:index, :create, :show, :update]
    post "/stripe/connect", to: "stripe_connect#create"
    get "/analytics/summary", to: "analytics#summary"
  end

  get "/public/shops/:shop_id/menu", to: "public/menus#show"

  post "/payments", to: "payments#create"
  post "/webhooks/stripe", to: "stripe_webhooks#create"
end
