-- Syauqi Fresh Seafood — skema awal (demo)

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Katalog
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  type text not null default 'fresh' check (type in ('fresh', 'frozen')),
  size_label text,
  short_description text,
  description text,
  cooking_tips text,
  show_price boolean not null default true,
  price_per_kg int check (price_per_kg is null or price_per_kg >= 0),
  compare_price int check (compare_price is null or compare_price >= 0),
  min_order_kg numeric(6, 2) not null default 0.5,
  stock_status text not null default 'available' check (stock_status in ('available', 'limited', 'out')),
  badges text[] not null default '{}',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  sold_count int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id);

create table public.price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  min_kg numeric(8, 2) not null check (min_kg > 0),
  price_per_kg int not null check (price_per_kg >= 0),
  unique (product_id, min_kg)
);

create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  kind text not null check (kind in ('weight', 'processing')),
  label text not null,
  value numeric(8, 2),
  extra_price int not null default 0 check (extra_price >= 0),
  sort_order int not null default 0
);
create index product_options_product_idx on public.product_options (product_id);

create table public.bundles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  price int not null check (price >= 0),
  compare_price int,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.bundle_items (
  bundle_id uuid not null references public.bundles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  qty_kg numeric(8, 2) not null check (qty_kg > 0),
  primary key (bundle_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Konten
-- ---------------------------------------------------------------------------
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link text,
  cta_label text,
  starts_at timestamptz,
  ends_at timestamptz,
  show_countdown boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  rating int not null default 5 check (rating between 1 and 5),
  content text not null,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('youtube', 'tiktok', 'instagram')),
  url text not null,
  title text,
  thumbnail_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table public.shipping_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee int not null default 0 check (fee >= 0),
  min_free_shipping int,
  eta text,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pesanan & event
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_name text not null,
  customer_phone text not null,
  method text not null check (method in ('delivery', 'pickup')),
  address text,
  area_id uuid references public.shipping_areas (id) on delete set null,
  area_name text,
  delivery_date date,
  notes text,
  subtotal int not null default 0,
  shipping_fee int not null default 0,
  total int not null default 0,
  has_unpriced boolean not null default false,
  status text not null default 'new' check (status in ('new', 'confirmed', 'shipped', 'done', 'cancelled')),
  source text not null default 'web',
  created_at timestamptz not null default now()
);
create index orders_created_idx on public.orders (created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  bundle_id uuid references public.bundles (id) on delete set null,
  name_snapshot text not null,
  qty_kg numeric(8, 2) not null,
  processing text,
  notes text,
  unit_price int,
  extra_price int not null default 0,
  line_total int
);
create index order_items_order_idx on public.order_items (order_id);

create table public.events (
  id bigint generated always as identity primary key,
  type text not null check (type in ('wa_click', 'add_to_cart', 'order_submit', 'quote_request')),
  product_id uuid references public.products (id) on delete set null,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index events_type_created_idx on public.events (type, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.price_tiers enable row level security;
alter table public.product_options enable row level security;
alter table public.bundles enable row level security;
alter table public.bundle_items enable row level security;
alter table public.banners enable row level security;
alter table public.testimonials enable row level security;
alter table public.videos enable row level security;
alter table public.faqs enable row level security;
alter table public.shipping_areas enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.events enable row level security;

create policy "admin read self" on public.admin_users for select to authenticated using (public.is_admin());

-- Publik: baca data aktif
create policy "public read" on public.categories for select using (is_active or public.is_admin());
create policy "public read" on public.products for select using (is_active or public.is_admin());
create policy "public read" on public.product_images for select using (true);
create policy "public read" on public.price_tiers for select using (true);
create policy "public read" on public.product_options for select using (true);
create policy "public read" on public.bundles for select using (is_active or public.is_admin());
create policy "public read" on public.bundle_items for select using (true);
create policy "public read" on public.banners for select using (is_active or public.is_admin());
create policy "public read" on public.testimonials for select using (is_active or public.is_admin());
create policy "public read" on public.videos for select using (is_active or public.is_admin());
create policy "public read" on public.faqs for select using (is_active or public.is_admin());
create policy "public read" on public.shipping_areas for select using (is_active or public.is_admin());
create policy "public read" on public.settings for select using (true);

-- Admin: tulis semua
do $$
declare t text;
begin
  foreach t in array array[
    'categories', 'products', 'product_images', 'price_tiers', 'product_options',
    'bundles', 'bundle_items', 'banners', 'testimonials', 'videos', 'faqs',
    'shipping_areas', 'settings', 'orders', 'order_items'
  ] loop
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

create policy "admin read" on public.orders for select to authenticated using (public.is_admin());
create policy "admin read" on public.order_items for select to authenticated using (public.is_admin());

-- Event: publik boleh mencatat, hanya admin yang membaca
create policy "public insert" on public.events for insert with check (type in ('wa_click', 'add_to_cart', 'quote_request'));
create policy "admin read" on public.events for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do nothing;

create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Pesanan: harga dihitung ulang di server
-- ---------------------------------------------------------------------------
-- payload:
-- {
--   "customer_name": "...", "customer_phone": "...", "method": "delivery|pickup",
--   "address": "...", "area_id": "uuid", "delivery_date": "2026-10-15", "notes": "...",
--   "items": [
--     { "product_id": "uuid", "qty_kg": 2, "processing_option_id": "uuid", "notes": "..." },
--     { "bundle_id": "uuid", "qty": 1 }
--   ]
-- }
create or replace function public.place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now_local timestamp := now() at time zone 'Asia/Jakarta';
  v_prefix text := 'SFS-' || to_char(v_now_local, 'YYMMDD') || '-';
  v_seq int;
  v_code text;
  v_order_id uuid;
  v_item jsonb;
  v_product public.products;
  v_bundle public.bundles;
  v_option public.product_options;
  v_area public.shipping_areas;
  v_show_prices boolean;
  v_free_min int;
  v_qty numeric;
  v_unit int;
  v_extra int;
  v_line int;
  v_subtotal int := 0;
  v_unpriced boolean := false;
  v_shipping int := 0;
  v_method text := coalesce(payload ->> 'method', 'delivery');
  v_items_out jsonb := '[]'::jsonb;
begin
  if coalesce(trim(payload ->> 'customer_name'), '') = '' then
    raise exception 'Nama wajib diisi';
  end if;
  if coalesce(trim(payload ->> 'customer_phone'), '') = '' then
    raise exception 'Nomor WhatsApp wajib diisi';
  end if;
  if v_method not in ('delivery', 'pickup') then
    raise exception 'Metode pengiriman tidak valid';
  end if;
  if jsonb_typeof(payload -> 'items') <> 'array' or jsonb_array_length(payload -> 'items') = 0 then
    raise exception 'Keranjang kosong';
  end if;
  if jsonb_array_length(payload -> 'items') > 50 then
    raise exception 'Terlalu banyak item';
  end if;

  select coalesce((value)::text::boolean, true) into v_show_prices from settings where key = 'show_prices';
  v_show_prices := coalesce(v_show_prices, true);
  select nullif((value)::text, 'null')::int into v_free_min from settings where key = 'free_shipping_min';

  perform pg_advisory_xact_lock(hashtext('place_order'));
  select count(*) + 1 into v_seq from orders where order_code like v_prefix || '%';
  v_code := v_prefix || lpad(v_seq::text, 3, '0');

  insert into orders (order_code, customer_name, customer_phone, method, address, delivery_date, notes)
  values (
    v_code,
    left(trim(payload ->> 'customer_name'), 120),
    left(trim(payload ->> 'customer_phone'), 30),
    v_method,
    left(nullif(trim(payload ->> 'address'), ''), 500),
    nullif(payload ->> 'delivery_date', '')::date,
    left(nullif(trim(payload ->> 'notes'), ''), 1000)
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(payload -> 'items') loop
    if v_item ? 'bundle_id' and nullif(v_item ->> 'bundle_id', '') is not null then
      select * into v_bundle from bundles where id = (v_item ->> 'bundle_id')::uuid and is_active;
      if not found then
        raise exception 'Paket tidak ditemukan';
      end if;
      v_qty := greatest(1, coalesce((v_item ->> 'qty')::numeric, 1));
      if v_show_prices then
        v_unit := v_bundle.price;
        v_line := round(v_bundle.price * v_qty);
        v_subtotal := v_subtotal + v_line;
      else
        v_unit := null; v_line := null; v_unpriced := true;
      end if;
      insert into order_items (order_id, bundle_id, name_snapshot, qty_kg, unit_price, line_total, notes)
      values (v_order_id, v_bundle.id, v_bundle.name, v_qty, v_unit, v_line, left(v_item ->> 'notes', 300));
      v_items_out := v_items_out || jsonb_build_object(
        'name', v_bundle.name, 'kind', 'bundle', 'qty', v_qty, 'unit_price', v_unit, 'line_total', v_line);
      continue;
    end if;

    select * into v_product from products where id = (v_item ->> 'product_id')::uuid and is_active;
    if not found then
      raise exception 'Produk tidak ditemukan';
    end if;
    if v_product.stock_status = 'out' then
      raise exception '% sedang habis', v_product.name;
    end if;

    v_qty := coalesce((v_item ->> 'qty_kg')::numeric, 0);
    if v_qty <= 0 or v_qty > 1000 then
      raise exception 'Berat tidak valid untuk %', v_product.name;
    end if;

    v_option := null;
    v_extra := 0;
    if nullif(v_item ->> 'processing_option_id', '') is not null then
      select * into v_option from product_options
      where id = (v_item ->> 'processing_option_id')::uuid and product_id = v_product.id and kind = 'processing';
      v_extra := coalesce(v_option.extra_price, 0);
    end if;

    if v_show_prices and v_product.show_price and v_product.price_per_kg is not null then
      select coalesce(
        (select t.price_per_kg from price_tiers t
          where t.product_id = v_product.id and t.min_kg <= v_qty
          order by t.min_kg desc limit 1),
        v_product.price_per_kg)
      into v_unit;
      v_line := round((v_unit + v_extra) * v_qty);
      v_subtotal := v_subtotal + v_line;
    else
      v_unit := null; v_line := null; v_unpriced := true;
    end if;

    insert into order_items (order_id, product_id, name_snapshot, qty_kg, processing, notes, unit_price, extra_price, line_total)
    values (
      v_order_id, v_product.id,
      v_product.name || coalesce(' (' || v_product.size_label || ')', ''),
      v_qty, v_option.label, left(v_item ->> 'notes', 300), v_unit, v_extra, v_line
    );

    update products set sold_count = sold_count + 1 where id = v_product.id;

    v_items_out := v_items_out || jsonb_build_object(
      'name', v_product.name || coalesce(' (' || v_product.size_label || ')', ''),
      'kind', 'product', 'qty', v_qty, 'processing', v_option.label,
      'unit_price', v_unit, 'extra_price', v_extra, 'line_total', v_line,
      'notes', v_item ->> 'notes');
  end loop;

  if v_method = 'delivery' and nullif(payload ->> 'area_id', '') is not null then
    select * into v_area from shipping_areas where id = (payload ->> 'area_id')::uuid and is_active;
    if found then
      v_shipping := v_area.fee;
      if coalesce(v_area.min_free_shipping, v_free_min) is not null
         and v_subtotal >= coalesce(v_area.min_free_shipping, v_free_min) then
        v_shipping := 0;
      end if;
    end if;
  end if;

  update orders set
    area_id = v_area.id,
    area_name = v_area.name,
    subtotal = v_subtotal,
    shipping_fee = v_shipping,
    total = v_subtotal + v_shipping,
    has_unpriced = v_unpriced
  where id = v_order_id;

  insert into events (type, meta) values ('order_submit', jsonb_build_object('order_code', v_code));

  return jsonb_build_object(
    'order_code', v_code,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping,
    'total', v_subtotal + v_shipping,
    'has_unpriced', v_unpriced,
    'area_name', v_area.name,
    'items', v_items_out
  );
end;
$$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;

-- Statistik dashboard CMS
create or replace function public.dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select jsonb_build_object(
    'orders_today', (select count(*) from orders where (created_at at time zone 'Asia/Jakarta')::date = v_today),
    'orders_week', (select count(*) from orders where (created_at at time zone 'Asia/Jakarta')::date > v_today - 7),
    'revenue_week', (select coalesce(sum(total), 0) from orders
                      where (created_at at time zone 'Asia/Jakarta')::date > v_today - 7 and status <> 'cancelled'),
    'orders_new', (select count(*) from orders where status = 'new'),
    'wa_clicks_week', (select count(*) from events where type = 'wa_click' and created_at > now() - interval '7 days'),
    'add_to_cart_week', (select count(*) from events where type = 'add_to_cart' and created_at > now() - interval '7 days'),
    'top_products', coalesce((
      select jsonb_agg(t) from (
        select oi.name_snapshot as name, sum(oi.qty_kg) as qty_kg, count(*) as orders
        from order_items oi join orders o on o.id = oi.order_id
        where o.created_at > now() - interval '30 days' and o.status <> 'cancelled'
        group by oi.name_snapshot order by count(*) desc, sum(oi.qty_kg) desc limit 5
      ) t), '[]'::jsonb),
    'daily', coalesce((
      select jsonb_agg(d order by d.day) from (
        select g.day::date as day,
               (select count(*) from orders o where (o.created_at at time zone 'Asia/Jakarta')::date = g.day::date) as orders
        from generate_series(v_today - 6, v_today, interval '1 day') g(day)
      ) d), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

grant execute on function public.dashboard_stats() to authenticated;
