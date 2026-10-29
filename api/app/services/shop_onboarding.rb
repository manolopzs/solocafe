class ShopOnboarding
  class NotReady < StandardError; end

  STARTER_CATEGORIES = [
    { name: "Bebidas calientes", sort_order: 1 },
    { name: "Bebidas frías", sort_order: 2 },
    { name: "Panadería", sort_order: 3 }
  ].freeze

  STARTER_GROUPS = [
    {
      name: "Leche",
      min_select: 0,
      max_select: 1,
      sort_order: 1,
      options: [
        { name: "Entera", price_cents: 0, sort_order: 1 },
        { name: "Sin lactosa", price_cents: 30, sort_order: 2 },
        { name: "Almendra", price_cents: 50, sort_order: 3 }
      ]
    },
    {
      name: "Tamaño",
      min_select: 1,
      max_select: 1,
      sort_order: 2,
      options: [
        { name: "Pequeño", price_cents: 0, sort_order: 1 },
        { name: "Mediano", price_cents: 40, sort_order: 2 },
        { name: "Grande", price_cents: 80, sort_order: 3 }
      ]
    }
  ].freeze

  STARTER_ITEMS = [
    { name: "Café", description: "Café espresso corto, intenso y con cuerpo.", price_cents: 180, category_index: 0, prep_time_min: 2, groups: [ "Tamaño" ], image_url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=240&h=240&q=70" },
    { name: "Cappuccino", description: "Espresso doble con leche vaporizada y espuma cremosa.", price_cents: 280, category_index: 0, prep_time_min: 4, groups: [ "Leche", "Tamaño" ], image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=240&h=240&q=70" },
    { name: "Latte Vainilla", description: "Café suave con leche caliente y un toque de vainilla.", price_cents: 320, category_index: 0, prep_time_min: 4, groups: [ "Tamaño" ], image_url: "https://images.unsplash.com/photo-1461023058943-48dbf1399192?auto=format&fit=crop&w=240&h=240&q=70" },
    { name: "Americano", description: "Café espresso con agua caliente, intenso y ligero.", price_cents: 220, category_index: 0, prep_time_min: 3, groups: [ "Tamaño" ] },
    { name: "Cold Brew", description: "Café infusionado en frío por 18 horas. Suave y refrescante.", price_cents: 340, category_index: 1, prep_time_min: 2, groups: [ "Tamaño" ], image_url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=240&h=240&q=70" },
    { name: "Frappe Mocha", description: "Café, hielo, chocolate y crema batida.", price_cents: 390, category_index: 1, prep_time_min: 5, groups: [ "Tamaño" ], image_url: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=240&h=240&q=70" },
    { name: "Croissant de Mantequilla", description: "Hojaldre dorado y crujiente, horneado a diario.", price_cents: 250, category_index: 2, prep_time_min: 1, groups: [], image_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=240&h=240&q=70" },
    { name: "Muffin de arándanos", description: "Esponjoso con arándanos frescos y un toque de limón.", price_cents: 280, category_index: 2, prep_time_min: 1, groups: [] }
  ].freeze

  def self.snapshot(shop)
    stripe = stripe_state(shop)
    steps = [
      { key: "menu", done: menu_ready?(shop) },
      { key: "stripe", done: stripe[:status] == "active" },
      { key: "hours", done: hours_confirmed?(shop) },
      { key: "live", done: shop.status == "active" }
    ]
    blockers = steps.reject { |step| step[:done] || step[:key] == "live" }.map { |step| step[:key] }

    {
      status: shop.status,
      live: shop.status == "active",
      can_go_live: shop.status == "draft" && blockers.empty?,
      blockers: blockers,
      hours_confirmed: hours_confirmed?(shop),
      steps: steps,
      stripe: stripe
    }
  end

  def self.go_live!(shop)
    return snapshot(shop) if shop.status == "active"

    current = snapshot(shop)
    raise NotReady, current[:blockers].join(",") if current[:blockers].any? || shop.status != "draft"

    shop.update!(status: "active")
    snapshot(shop)
  end

  def self.apply_stripe_account!(shop, account)
    details = flag(account, :details_submitted)
    charges = flag(account, :charges_enabled)
    status = if details && charges
      "active"
    elsif details
      "restricted"
    else
      "pending"
    end

    shop.update!(stripe_account_id: account_id(account), stripe_connect_status: status)
    stripe_state(shop)
  end

  def self.seed_starter_menu!(shop)
    TenantScoped.unscoped_for_system do
      return false if MenuItem.where(shop_id: shop.id).exists?

      seed_starter_menu_records!(shop)
    end

    true
  end

  def self.seed_starter_menu_records!(shop)
    ActiveRecord::Base.transaction do
      categories = STARTER_CATEGORIES.map do |category|
        MenuCategory.create!(shop_id: shop.id, name: category[:name], sort_order: category[:sort_order])
      end

      groups = STARTER_GROUPS.to_h do |group|
        record = ModifierGroup.create!(
          shop_id: shop.id,
          name: group[:name],
          min_select: group[:min_select],
          max_select: group[:max_select],
          sort_order: group[:sort_order]
        )
        group[:options].each do |option|
          ModifierOption.create!(
            group: record,
            name: option[:name],
            price_cents: option[:price_cents],
            sort_order: option[:sort_order]
          )
        end
        [ group[:name], record ]
      end

      STARTER_ITEMS.each do |item|
        record = MenuItem.create!(
          shop_id: shop.id,
          category_id: categories.fetch(item[:category_index]).id,
          name: item[:name],
          description: item[:description],
          price_cents: item[:price_cents],
          image_url: item[:image_url],
          prep_time_min: item[:prep_time_min]
        )
        item[:groups].each do |group_name|
          ItemModifierLink.create!(item: record, group: groups.fetch(group_name), is_required: false)
        end
      end
    end

    true
  end

  def self.unique_slug(name, requested = nil)
    source = requested.presence || name
    base = I18n.transliterate(source.to_s).downcase.gsub(/[^a-z0-9]+/, "-").gsub(/\A-+|-+\z/, "")
    base = "cafeteria" if base.blank?

    slug = base
    suffix = 2
    while Shop.exists?(slug: slug)
      slug = "#{base}-#{suffix}"
      suffix += 1
    end
    slug
  end

  def self.menu_ready?(shop)
    TenantScoped.unscoped_for_system do
      MenuItem.where(shop_id: shop.id, is_active: true).exists?
    end
  end

  def self.hours_confirmed?(shop)
    Shop.confirmed_open_day?(shop.read_attribute(:operating_hours))
  end

  def self.stripe_state(shop)
    if shop.stripe_account_id.blank?
      return { status: "not_started", charges_enabled: false, details_submitted: false }
    end

    status = %w[pending restricted active].include?(shop.stripe_connect_status) ? shop.stripe_connect_status : "pending"
    {
      status: status,
      charges_enabled: status == "active",
      details_submitted: %w[restricted active].include?(status)
    }
  end

  def self.account_id(account)
    account.respond_to?(:id) ? account.id : account[:id] || account["id"]
  end

  def self.flag(account, key)
    value = if account.respond_to?(key)
      account.public_send(key)
    elsif account.respond_to?(:[])
      account[key].nil? ? account[key.to_s] : account[key]
    end
    ActiveModel::Type::Boolean.new.cast(value)
  end
end
