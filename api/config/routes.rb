Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  post "/auth/signup", to: "authentication#signup"
  post "/auth/login", to: "authentication#login"
  get "/auth/me", to: "authentication#me"
  post "/auth/password_resets", to: "password_resets#create"
  patch "/auth/password_resets/:token", to: "password_resets#update"
  put "/auth/password_resets/:token", to: "password_resets#update"

  get "/customers/me/loyalty", to: "customers#loyalty"
  get "/customers/me", to: "customers#me"
  patch "/customers/me", to: "customers#update"
  get "/customers/me/orders", to: "customers#orders"
  get "/customers/me/orders/:id", to: "customers#order"
  get "/customers/me/payment_methods", to: "customer_payment_methods#index"
  delete "/customers/me/payment_methods/:id", to: "customer_payment_methods#destroy"

  resources :shops, only: [:index, :create, :update]
  get "/shops/:slug", to: "shops#show"

  get "/shops/:shop_id/orders/recent", to: "orders#recent", as: :recent_shop_orders
  get "/shops/:shop_id/orders/usual", to: "orders#usual", as: :usual_shop_order

  scope "/shops/:shop_id", as: :shop do
    resources :menu_categories, only: [:index, :create, :update, :destroy]
    resources :menu_items, only: [:index, :create, :update, :destroy]
    resources :item_modifier_links, only: [:index, :create, :destroy]
    resources :modifier_groups, only: [:index, :create, :update, :destroy] do
      resources :modifier_options, only: [:index, :create, :update, :destroy]
    end
    resources :orders, only: [:index, :create, :show, :update]
    resources :push_devices, only: [:index, :create, :destroy]
    resources :favorites, only: [:index, :create, :destroy], controller: "customer_favorites", param: :menu_item_id
    post "/stripe/connect", to: "stripe_connect#create"
    post "/stripe/status", to: "stripe_connect#status"
    get "/onboarding", to: "shop_onboardings#show"
    post "/onboarding/go_live", to: "shop_onboardings#go_live"
    get "/analytics/summary", to: "analytics#summary"
  end

  get "/public/pricing", to: "public/pricing#show"
  get "/public/shops", to: "public/shops#index"
  get "/public/storefront/:slug", to: "public/storefronts#show"
  get "/public/shops/:shop_id/menu", to: "public/menus#show"
  post "/public/shops/:shop_id/cart/preview", to: "public/carts#preview"
  get "/public/shops/:shop_id/pickup_slots", to: "public/pickup_slots#index"
  get "/public/orders/:id", to: "orders#show_public"
  post "/public/orders/:id/push_devices", to: "public/order_pushes#create"

  post "/payments", to: "payments#create"
  post "/payments/sync", to: "payments#sync"
  post "/webhooks/stripe", to: "stripe_webhooks#create"
end
