-- =====================================================================
-- Nhà trọ VinUni AI Thực Chiến – schema, RLS, Storage và Realtime
-- Chạy bằng: npx supabase db push   (hoặc dán vào SQL Editor của Supabase)
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. Bảng admin_users: chỉ những user có trong bảng này mới là admin.
--    Không có policy INSERT cho client => không tài khoản nào tự thành admin.
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Người dùng chỉ được xem chính dòng của mình (để client biết mình có phải admin không)
drop policy if exists "admin_users: self read" on public.admin_users;
create policy "admin_users: self read"
  on public.admin_users for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Hàm kiểm tra admin, dùng trong mọi policy
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Bảng properties (tin đăng)
-- ---------------------------------------------------------------------
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(title) between 1 and 150),
  address text not null check (char_length(address) between 1 and 300),
  district text not null check (char_length(district) between 1 and 100),
  city text not null check (char_length(city) between 1 and 100),
  price bigint not null check (price > 0),
  deposit bigint not null default 0 check (deposit >= 0),
  electricity_price bigint not null default 0 check (electricity_price >= 0),
  electricity_unit text not null default 'kWh',
  water_price bigint not null default 0 check (water_price >= 0),
  water_unit text not null default 'm³',
  service_fee bigint not null default 0 check (service_fee >= 0),
  service_fee_included boolean not null default false,
  area_m2 numeric(8, 1) not null check (area_m2 > 0),
  bedrooms smallint not null default 1 check (bedrooms between 0 and 20),
  bathrooms smallint not null default 1 check (bathrooms between 0 and 20),
  floor smallint check (floor between 0 and 200),
  total_floors smallint check (total_floors between 0 and 200),
  amenities text[] not null default '{}',
  description text not null default '' check (char_length(description) <= 5000),
  contact_name text not null,
  contact_phone text not null,
  contact_zalo text,
  is_available boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_published_idx
  on public.properties (is_published, is_available, updated_at desc);

-- Tự động cập nhật updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. Bảng property_images (ảnh của tin)
-- ---------------------------------------------------------------------
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  url text not null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists property_images_property_idx
  on public.property_images (property_id, sort_order);

-- Mỗi tin chỉ có tối đa một ảnh đại diện
create unique index if not exists property_images_one_cover_idx
  on public.property_images (property_id)
  where is_cover;

-- Khi ảnh thay đổi thì tin cũng được coi là vừa cập nhật
create or replace function public.touch_property_from_image()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pid uuid := coalesce(new.property_id, old.property_id);
begin
  update public.properties set updated_at = now() where id = pid;
  return null;
end;
$$;

drop trigger if exists property_images_touch on public.property_images;
create trigger property_images_touch
  after insert or update or delete on public.property_images
  for each row execute function public.touch_property_from_image();

-- ---------------------------------------------------------------------
-- 4. Row Level Security
--    - anon / người không phải admin: chỉ đọc tin đang công khai và ảnh của tin đó
--    - admin: toàn quyền CRUD
-- ---------------------------------------------------------------------
alter table public.properties enable row level security;
alter table public.property_images enable row level security;

drop policy if exists "properties: public read published" on public.properties;
create policy "properties: public read published"
  on public.properties for select
  to anon, authenticated
  using (is_published or public.is_admin());

drop policy if exists "properties: admin insert" on public.properties;
create policy "properties: admin insert"
  on public.properties for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "properties: admin update" on public.properties;
create policy "properties: admin update"
  on public.properties for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "properties: admin delete" on public.properties;
create policy "properties: admin delete"
  on public.properties for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "property_images: public read published" on public.property_images;
create policy "property_images: public read published"
  on public.property_images for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.properties p
      where p.id = property_id and p.is_published
    )
  );

drop policy if exists "property_images: admin insert" on public.property_images;
create policy "property_images: admin insert"
  on public.property_images for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "property_images: admin update" on public.property_images;
create policy "property_images: admin update"
  on public.property_images for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "property_images: admin delete" on public.property_images;
create policy "property_images: admin delete"
  on public.property_images for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. Realtime: trigger phát sự kiện broadcast công khai trên topic "listings".
--    Client chỉ nhận {table, op, id} rồi tự tải lại dữ liệu (qua RLS),
--    nên tin bị ẩn/xóa cũng được đồng bộ mà không lộ dữ liệu riêng tư.
-- ---------------------------------------------------------------------
create or replace function public.broadcast_listing_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  item_id text := case when tg_table_name = 'properties' then rec ->> 'id' else rec ->> 'property_id' end;
begin
  perform realtime.send(
    jsonb_build_object('table', tg_table_name, 'op', tg_op, 'id', item_id),
    'change',
    'listings',
    false
  );
  return null;
end;
$$;

drop trigger if exists properties_broadcast on public.properties;
create trigger properties_broadcast
  after insert or update or delete on public.properties
  for each row execute function public.broadcast_listing_change();

drop trigger if exists property_images_broadcast on public.property_images;
create trigger property_images_broadcast
  after insert or update or delete on public.property_images
  for each row execute function public.broadcast_listing_change();

-- ---------------------------------------------------------------------
-- 6. Storage: bucket ảnh công khai, chỉ admin được ghi/xóa
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "property-images: public read" on storage.objects;
create policy "property-images: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'property-images');

drop policy if exists "property-images: admin insert" on storage.objects;
create policy "property-images: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-images' and public.is_admin());

drop policy if exists "property-images: admin update" on storage.objects;
create policy "property-images: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-images' and public.is_admin())
  with check (bucket_id = 'property-images' and public.is_admin());

drop policy if exists "property-images: admin delete" on storage.objects;
create policy "property-images: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images' and public.is_admin());
