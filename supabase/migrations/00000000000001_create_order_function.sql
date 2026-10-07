create or replace function create_order(
  p_shop_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_pickup_type text,
  p_pickup_slot_id uuid,
  p_special_instructions text,
  p_items jsonb
) returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_customer_id uuid;
  v_subtotal_cents integer := 0;
  v_tax_cents integer := 0;
  v_total_cents integer := 0;
  v_currency text;
  v_tax_included boolean;
  v_tax_rate numeric;
  v_item_record record;
  v_option_record record;
  v_item_subtotal integer;
  v_modifier_total integer;
  v_quantity integer;
  v_item_id uuid;
  v_option_id uuid;
  v_unit_price integer;
  v_order_item_id uuid;
  v_modifier_ids uuid[];
  v_pickup_time timestamp with time zone;
begin
  select currency, tax_included, tax_rate
  into v_currency, v_tax_included, v_tax_rate
  from shops
  where id = p_shop_id;

  if v_currency is null then
    raise exception 'Shop not found';
  end if;

  if p_pickup_slot_id is not null then
    select (s.slot_date + s.start_time) at time zone sh.timezone
    into v_pickup_time
    from pickup_slots s
    join shops sh on sh.id = s.shop_id
    where s.id = p_pickup_slot_id and s.shop_id = p_shop_id;
  end if;

  for v_item_record in select * from jsonb_to_recordset(p_items) as x(item_id uuid, quantity integer, modifier_option_ids uuid[])
  loop
    select price_cents into v_unit_price
    from menu_items
    where id = v_item_record.item_id
      and shop_id = p_shop_id
      and is_active = true
      and is_86ed = false;

    if v_unit_price is null then
      raise exception 'Invalid or unavailable item: %', v_item_record.item_id;
    end if;

    v_modifier_total := 0;
    if v_item_record.modifier_option_ids is not null then
      foreach v_option_id in array v_item_record.modifier_option_ids
      loop
        select mo.price_cents into v_option_record
        from modifier_options mo
        join modifier_groups mg on mg.id = mo.group_id
        join item_modifier_links iml on iml.group_id = mg.id
        where mo.id = v_option_id
          and mg.shop_id = p_shop_id
          and mo.is_active = true
          and iml.item_id = v_item_record.item_id;

        if v_option_record is null then
          raise exception 'Invalid modifier option: %', v_option_id;
        end if;

        v_modifier_total := v_modifier_total + v_option_record.price_cents;
      end loop;
    end if;

    v_item_subtotal := (v_unit_price + v_modifier_total) * v_item_record.quantity;
    v_subtotal_cents := v_subtotal_cents + v_item_subtotal;
  end loop;

  if v_tax_included then
    v_tax_cents := 0;
  else
    v_tax_cents := round(v_subtotal_cents * v_tax_rate);
  end if;

  v_total_cents := v_subtotal_cents + v_tax_cents;

  insert into customers (name, phone)
  values (p_customer_name, p_customer_phone)
  returning id into v_customer_id;

  insert into orders (
    shop_id, customer_id, status, payment_status,
    subtotal_cents, tax_cents, total_cents, currency,
    pickup_type, pickup_slot_id, pickup_time,
    customer_name, customer_phone, special_instructions
  ) values (
    p_shop_id, v_customer_id, 'received', 'pending',
    v_subtotal_cents, v_tax_cents, v_total_cents, v_currency,
    p_pickup_type, p_pickup_slot_id, v_pickup_time,
    p_customer_name, p_customer_phone, p_special_instructions
  )
  returning id into v_order_id;

  for v_item_record in select * from jsonb_to_recordset(p_items) as x(item_id uuid, quantity integer, modifier_option_ids uuid[])
  loop
    select price_cents into v_unit_price from menu_items where id = v_item_record.item_id;

    v_modifier_total := 0;
    if v_item_record.modifier_option_ids is not null then
      foreach v_option_id in array v_item_record.modifier_option_ids
      loop
        select mo.price_cents into v_option_record
        from modifier_options mo
        join modifier_groups mg on mg.id = mo.group_id
        where mo.id = v_option_id and mg.shop_id = p_shop_id;
        v_modifier_total := v_modifier_total + coalesce(v_option_record.price_cents, 0);
      end loop;
    end if;

    v_item_subtotal := (v_unit_price + v_modifier_total) * v_item_record.quantity;

    insert into order_items (order_id, item_id, item_name_snapshot, unit_price_cents, quantity, subtotal_cents)
    select v_order_id, mi.id, mi.name, v_unit_price + v_modifier_total, v_item_record.quantity, v_item_subtotal
    from menu_items mi
    where mi.id = v_item_record.item_id
    returning id into v_order_item_id;

    if v_item_record.modifier_option_ids is not null then
      foreach v_option_id in array v_item_record.modifier_option_ids
      loop
        insert into order_item_modifiers (order_item_id, option_id, option_name_snapshot, price_cents)
        select v_order_item_id, mo.id, mo.name, mo.price_cents
        from modifier_options mo
        where mo.id = v_option_id;
      end loop;
    end if;
  end loop;

  insert into payments (order_id, amount_cents, currency, status)
  values (v_order_id, v_total_cents, v_currency, 'pending');

  if p_pickup_slot_id is not null then
    insert into slot_reservations (slot_id, order_id)
    values (p_pickup_slot_id, v_order_id);
  end if;

  insert into events (shop_id, order_id, type, payload)
  values (p_shop_id, v_order_id, 'order_created', jsonb_build_object('total_cents', v_total_cents));

  return v_order_id;
end;
$$;
