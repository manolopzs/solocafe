create extension if not exists "uuid-ossp";

create table subscription_tiers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  monthly_price_cents integer not null default 0,
  included_orders integer not null default 0,
  overage_per_order_cents integer not null default 0,
  stripe_price_id text,
  is_active boolean not null default true,
  created_at timestamp with time zone default now()
);

create table shops (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  legal_name text,
  timezone text not null default 'America/Mexico_City',
  currency text not null default 'MXN',
  locale text not null default 'es',
  tax_included boolean not null default true,
  tax_rate numeric(5,4) not null default 0,
  address text,
  lat numeric(10,8),
  lng numeric(11,8),
  logo_url text,
  brand_color text default '#000000',
  stripe_account_id text,
  stripe_connect_status text not null default 'pending',
  owner_id uuid references auth.users(id) on delete set null,
  status text not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table shop_members (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'barista',
  created_at timestamp with time zone default now(),
  unique (shop_id, user_id)
);

create table shop_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null unique references shops(id) on delete cascade,
  tier_id uuid not null references subscription_tiers(id),
  status text not null default 'active',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  stripe_subscription_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  phone text,
  email text,
  created_at timestamp with time zone default now()
);

create table menu_categories (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default now()
);

create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  category_id uuid references menu_categories(id) on delete set null,
  name text not null,
  description text,
  price_cents integer not null,
  image_url text,
  is_active boolean not null default true,
  is_86ed boolean not null default false,
  prep_time_min integer not null default 5,
  sort_order integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table modifier_groups (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  min_select integer not null default 0,
  max_select integer not null default 1,
  sort_order integer not null default 0,
  created_at timestamp with time zone default now()
);

create table modifier_options (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references modifier_groups(id) on delete cascade,
  name text not null,
  price_cents integer not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone default now()
);

create table item_modifier_links (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references menu_items(id) on delete cascade,
  group_id uuid not null references modifier_groups(id) on delete cascade,
  is_required boolean not null default false,
  created_at timestamp with time zone default now(),
  unique (item_id, group_id)
);

create table pickup_slots (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  slot_date date not null,
  start_time time not null,
  end_time time not null,
  capacity integer not null default 10,
  created_at timestamp with time zone default now()
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  status text not null default 'received',
  payment_status text not null default 'pending',
  subtotal_cents integer not null,
  tax_cents integer not null default 0,
  tip_cents integer not null default 0,
  total_cents integer not null,
  currency text not null,
  pickup_type text not null default 'asap',
  pickup_slot_id uuid references pickup_slots(id) on delete set null,
  pickup_time timestamp with time zone,
  customer_name text,
  customer_phone text,
  special_instructions text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  item_id uuid not null references menu_items(id),
  item_name_snapshot text not null,
  unit_price_cents integer not null,
  quantity integer not null default 1,
  subtotal_cents integer not null,
  created_at timestamp with time zone default now()
);

create table order_item_modifiers (
  id uuid primary key default uuid_generate_v4(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  option_id uuid not null references modifier_options(id),
  option_name_snapshot text not null,
  price_cents integer not null default 0,
  created_at timestamp with time zone default now()
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null unique references orders(id) on delete cascade,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  amount_cents integer not null,
  platform_fee_cents integer not null default 0,
  currency text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table slot_reservations (
  id uuid primary key default uuid_generate_v4(),
  slot_id uuid not null references pickup_slots(id) on delete cascade,
  order_id uuid not null unique references orders(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table events (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  created_at timestamp with time zone default now()
);

alter table shops enable row level security;
alter table shop_members enable row level security;
alter table shop_subscriptions enable row level security;
alter table customers enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table modifier_groups enable row level security;
alter table modifier_options enable row level security;
alter table item_modifier_links enable row level security;
alter table pickup_slots enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_item_modifiers enable row level security;
alter table payments enable row level security;
alter table slot_reservations enable row level security;
alter table events enable row level security;

/* Public read access to active shop profile and public menu */
create policy "shops_public_read"
  on shops for select
  using (status = 'active');

create policy "menu_categories_public_read"
  on menu_categories for select
  using (is_active = true and exists (
    select 1 from shops where shops.id = menu_categories.shop_id and shops.status = 'active'
  ));

create policy "menu_items_public_read"
  on menu_items for select
  using (is_active = true and is_86ed = false and exists (
    select 1 from shops where shops.id = menu_items.shop_id and shops.status = 'active'
  ));

create policy "modifier_groups_public_read"
  on modifier_groups for select
  using (exists (
    select 1 from shops where shops.id = modifier_groups.shop_id and shops.status = 'active'
  ));

create policy "modifier_options_public_read"
  on modifier_options for select
  using (is_active = true and exists (
    select 1 from modifier_groups
    join shops on shops.id = modifier_groups.shop_id
    where modifier_groups.id = modifier_options.group_id and shops.status = 'active'
  ));

create policy "item_modifier_links_public_read"
  on item_modifier_links for select
  using (exists (
    select 1 from menu_items
    join shops on shops.id = menu_items.shop_id
    where menu_items.id = item_modifier_links.item_id and shops.status = 'active'
  ));

create policy "pickup_slots_public_read"
  on pickup_slots for select
  using (exists (
    select 1 from shops where shops.id = pickup_slots.shop_id and shops.status = 'active'
  ));

/* Shop staff write access */
create or replace function is_shop_member(shop_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from shop_members
    where shop_members.shop_id = shop_uuid
      and shop_members.user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

create policy "shops_staff_manage"
  on shops for all
  using (is_shop_member(id) or owner_id = auth.uid())
  with check (is_shop_member(id) or owner_id = auth.uid());

create policy "shop_members_staff_manage"
  on shop_members for all
  using (is_shop_member(shop_id) or user_id = auth.uid())
  with check (is_shop_member(shop_id));

create policy "shop_subscriptions_staff_read"
  on shop_subscriptions for select
  using (is_shop_member(shop_id));

create policy "menu_categories_staff_manage"
  on menu_categories for all
  using (is_shop_member(shop_id))
  with check (is_shop_member(shop_id));

create policy "menu_items_staff_manage"
  on menu_items for all
  using (is_shop_member(shop_id))
  with check (is_shop_member(shop_id));

create policy "modifier_groups_staff_manage"
  on modifier_groups for all
  using (is_shop_member(shop_id))
  with check (is_shop_member(shop_id));

create policy "modifier_options_staff_manage"
  on modifier_options for all
  using (exists (
    select 1 from modifier_groups where modifier_groups.id = modifier_options.group_id and is_shop_member(modifier_groups.shop_id)
  ))
  with check (exists (
    select 1 from modifier_groups where modifier_groups.id = modifier_options.group_id and is_shop_member(modifier_groups.shop_id)
  ));

create policy "item_modifier_links_staff_manage"
  on item_modifier_links for all
  using (exists (
    select 1 from menu_items where menu_items.id = item_modifier_links.item_id and is_shop_member(menu_items.shop_id)
  ))
  with check (exists (
    select 1 from menu_items where menu_items.id = item_modifier_links.item_id and is_shop_member(menu_items.shop_id)
  ));

create policy "pickup_slots_staff_manage"
  on pickup_slots for all
  using (is_shop_member(shop_id))
  with check (is_shop_member(shop_id));

/* Orders */
create policy "orders_customer_read"
  on orders for select
  using (customer_id in (
    select id from customers where user_id = auth.uid()
  ));

create policy "orders_staff_manage"
  on orders for all
  using (is_shop_member(shop_id))
  with check (is_shop_member(shop_id));

create policy "order_items_customer_read"
  on order_items for select
  using (exists (
    select 1 from orders where orders.id = order_items.order_id and (
      orders.customer_id in (select id from customers where user_id = auth.uid())
      or is_shop_member(orders.shop_id)
    )
  ));

create policy "order_items_staff_manage"
  on order_items for all
  using (exists (
    select 1 from orders where orders.id = order_items.order_id and is_shop_member(orders.shop_id)
  ))
  with check (exists (
    select 1 from orders where orders.id = order_items.order_id and is_shop_member(orders.shop_id)
  ));

create policy "order_item_modifiers_read"
  on order_item_modifiers for select
  using (exists (
    select 1 from order_items
    join orders on orders.id = order_items.order_id
    where order_items.id = order_item_modifiers.order_item_id and (
      orders.customer_id in (select id from customers where user_id = auth.uid())
      or is_shop_member(orders.shop_id)
    )
  ));

create policy "order_item_modifiers_staff_manage"
  on order_item_modifiers for all
  using (exists (
    select 1 from order_items
    join orders on orders.id = order_items.order_id
    where order_items.id = order_item_modifiers.order_item_id and is_shop_member(orders.shop_id)
  ))
  with check (exists (
    select 1 from order_items
    join orders on orders.id = order_items.order_id
    where order_items.id = order_item_modifiers.order_item_id and is_shop_member(orders.shop_id)
  ));

/* Payments */
create policy "payments_read"
  on payments for select
  using (exists (
    select 1 from orders where orders.id = payments.order_id and (
      orders.customer_id in (select id from customers where user_id = auth.uid())
      or is_shop_member(orders.shop_id)
    )
  ));

create policy "payments_staff_manage"
  on payments for all
  using (exists (
    select 1 from orders where orders.id = payments.order_id and is_shop_member(orders.shop_id)
  ))
  with check (exists (
    select 1 from orders where orders.id = payments.order_id and is_shop_member(orders.shop_id)
  ));

/* Events */
create policy "events_read"
  on events for select
  using (is_shop_member(shop_id) or exists (
    select 1 from orders where orders.id = events.order_id and orders.customer_id in (
      select id from customers where user_id = auth.uid()
    )
  ));

create policy "events_insert"
  on events for insert
  with check (is_shop_member(shop_id));

/* Slot reservations */
create policy "slot_reservations_staff_manage"
  on slot_reservations for all
  using (exists (
    select 1 from pickup_slots where pickup_slots.id = slot_reservations.slot_id and is_shop_member(pickup_slots.shop_id)
  ))
  with check (exists (
    select 1 from pickup_slots where pickup_slots.id = slot_reservations.slot_id and is_shop_member(pickup_slots.shop_id)
  ));

create policy "slot_reservations_public_read"
  on slot_reservations for select
  using (exists (
    select 1 from pickup_slots
    join shops on shops.id = pickup_slots.shop_id
    where pickup_slots.id = slot_reservations.slot_id and shops.status = 'active'
  ));

/* Customers */
create policy "customers_self_manage"
  on customers for all
  using (user_id = auth.uid() or id in (
    select customer_id from orders where shop_id in (
      select shop_id from shop_members where user_id = auth.uid()
    )
  ))
  with check (user_id = auth.uid());

/* Indexes */
create index idx_shops_slug on shops(slug);
create index idx_shops_owner on shops(owner_id);
create index idx_shop_members_user on shop_members(user_id);
create index idx_menu_items_category on menu_items(category_id);
create index idx_menu_items_shop on menu_items(shop_id);
create index idx_orders_shop_status on orders(shop_id, status);
create index idx_orders_customer on orders(customer_id);
create index idx_events_order on events(order_id);
create index idx_payments_order on payments(order_id);

/* Default free tier */
insert into subscription_tiers (name, monthly_price_cents, included_orders, overage_per_order_cents)
values ('Free', 0, 100, 0)
on conflict do nothing;
