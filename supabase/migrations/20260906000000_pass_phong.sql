-- =====================================================================
-- Tính năng "Pass lại phòng"
-- Khách thuê tự đăng tin nhượng lại phòng đang ở. Khác với bảng
-- properties (chỉ admin đăng), bảng này cho phép người dùng ẩn danh
-- THÊM tin, nhưng KHÔNG được sửa hay xóa. Admin có toàn quyền.
-- Chạy bằng: npx supabase db push
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Bảng transfer_posts (tin pass phòng)
-- ---------------------------------------------------------------------
create table if not exists public.transfer_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(title) between 1 and 150),
  address text not null check (char_length(address) between 1 and 300),
  district text not null check (char_length(district) between 1 and 100),
  city text not null check (char_length(city) between 1 and 100),
  price bigint not null check (price > 0),
  deposit bigint not null default 0 check (deposit >= 0),
  -- Bắt buộc: cọc 1 tháng hay cọc 3 tháng
  deposit_months smallint not null check (deposit_months in (1, 3)),
  -- Bắt buộc: ngày hết hạn hợp đồng hiện tại
  contract_end_date date not null check (
    contract_end_date >= date '2000-01-01'
    and contract_end_date <= current_date + interval '10 years'
  ),
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
  contact_name text not null check (char_length(contact_name) between 1 and 100),
  contact_phone text not null check (char_length(contact_phone) between 8 and 20),
  contact_zalo text check (char_length(contact_zalo) <= 200),
  -- Đã pass được cho người khác chưa (admin đánh dấu)
  is_transferred boolean not null default false,
  -- Admin có thể ẩn tin khỏi trang công khai
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transfer_posts_published_idx
  on public.transfer_posts (is_published, is_transferred, updated_at desc);

create index if not exists transfer_posts_contract_end_idx
  on public.transfer_posts (contract_end_date);

drop trigger if exists transfer_posts_set_updated_at on public.transfer_posts;
create trigger transfer_posts_set_updated_at
  before update on public.transfer_posts
  for each row execute function public.set_updated_at();

comment on table public.transfer_posts is 'Tin pass lại phòng do khách tự đăng';
comment on column public.transfer_posts.deposit_months is 'Số tháng tiền cọc người nhận phải đóng: 1 hoặc 3';
comment on column public.transfer_posts.contract_end_date is 'Ngày hết hạn hợp đồng thuê hiện tại';
comment on column public.transfer_posts.is_transferred is 'Đã pass được phòng cho người khác chưa';

-- ---------------------------------------------------------------------
-- 2. Bảng transfer_post_images (ảnh của tin pass phòng)
-- ---------------------------------------------------------------------
create table if not exists public.transfer_post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.transfer_posts (id) on delete cascade,
  storage_path text not null,
  url text not null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists transfer_post_images_post_idx
  on public.transfer_post_images (post_id, sort_order);

create unique index if not exists transfer_post_images_one_cover_idx
  on public.transfer_post_images (post_id)
  where is_cover;

-- Ảnh thay đổi thì tin cũng được coi là vừa cập nhật (gộp theo câu lệnh)
create or replace function public.touch_transfer_posts_from_images()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.transfer_posts p
  set updated_at = now()
  where p.id in (select c.post_id from changed_rows c);
  return null;
end;
$$;

drop trigger if exists transfer_post_images_touch_insert on public.transfer_post_images;
create trigger transfer_post_images_touch_insert
  after insert on public.transfer_post_images
  referencing new table as changed_rows
  for each statement execute function public.touch_transfer_posts_from_images();

drop trigger if exists transfer_post_images_touch_update on public.transfer_post_images;
create trigger transfer_post_images_touch_update
  after update on public.transfer_post_images
  referencing new table as changed_rows
  for each statement execute function public.touch_transfer_posts_from_images();

drop trigger if exists transfer_post_images_touch_delete on public.transfer_post_images;
create trigger transfer_post_images_touch_delete
  after delete on public.transfer_post_images
  referencing old table as changed_rows
  for each statement execute function public.touch_transfer_posts_from_images();

-- ---------------------------------------------------------------------
-- 3. Row Level Security
--    - Ai cũng ĐỌC được tin đang công khai và ảnh của tin đó
--    - Ai cũng THÊM được tin mới, nhưng bắt buộc là tin công khai và
--      chưa pass; không tự đặt được các trạng thái khác
--    - SỬA và XÓA chỉ dành cho admin
-- ---------------------------------------------------------------------
alter table public.transfer_posts enable row level security;
alter table public.transfer_post_images enable row level security;

drop policy if exists "transfer_posts: public read published" on public.transfer_posts;
create policy "transfer_posts: public read published"
  on public.transfer_posts for select
  to anon, authenticated
  using (is_published or public.is_admin());

-- Khách tự đăng tin. Ràng buộc trạng thái để không ai chèn sẵn tin ẩn
-- hoặc tin đã đánh dấu pass xong.
drop policy if exists "transfer_posts: public insert" on public.transfer_posts;
create policy "transfer_posts: public insert"
  on public.transfer_posts for insert
  to anon, authenticated
  with check (is_published and not is_transferred);

drop policy if exists "transfer_posts: admin update" on public.transfer_posts;
create policy "transfer_posts: admin update"
  on public.transfer_posts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "transfer_posts: admin delete" on public.transfer_posts;
create policy "transfer_posts: admin delete"
  on public.transfer_posts for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "transfer_post_images: public read published" on public.transfer_post_images;
create policy "transfer_post_images: public read published"
  on public.transfer_post_images for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.transfer_posts p
      where p.id = post_id and p.is_published
    )
  );

-- Chỉ cho gắn ảnh vào tin vừa được tạo trong vòng 30 phút, để người khác
-- không chèn ảnh vào tin cũ của người lạ.
drop policy if exists "transfer_post_images: public insert" on public.transfer_post_images;
create policy "transfer_post_images: public insert"
  on public.transfer_post_images for insert
  to anon, authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.transfer_posts p
      where p.id = post_id
        and p.is_published
        and p.created_at > now() - interval '30 minutes'
    )
  );

drop policy if exists "transfer_post_images: admin update" on public.transfer_post_images;
create policy "transfer_post_images: admin update"
  on public.transfer_post_images for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "transfer_post_images: admin delete" on public.transfer_post_images;
create policy "transfer_post_images: admin delete"
  on public.transfer_post_images for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. Realtime: kênh riêng "transfers" để trang pass phòng tự cập nhật
--    mà không làm trang danh sách phòng tải lại vô ích.
-- ---------------------------------------------------------------------
create or replace function public.broadcast_transfer_posts_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
begin
  for r in select distinct c.id from changed_rows c loop
    perform realtime.send(
      jsonb_build_object('table', 'transfer_posts', 'op', tg_op, 'id', r.id::text),
      'change',
      'transfers',
      false
    );
  end loop;
  return null;
end;
$$;

create or replace function public.broadcast_transfer_images_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
begin
  for r in select distinct c.post_id from changed_rows c loop
    perform realtime.send(
      jsonb_build_object('table', 'transfer_post_images', 'op', tg_op, 'id', r.post_id::text),
      'change',
      'transfers',
      false
    );
  end loop;
  return null;
end;
$$;

drop trigger if exists transfer_posts_broadcast_insert on public.transfer_posts;
create trigger transfer_posts_broadcast_insert
  after insert on public.transfer_posts
  referencing new table as changed_rows
  for each statement execute function public.broadcast_transfer_posts_change();

drop trigger if exists transfer_posts_broadcast_update on public.transfer_posts;
create trigger transfer_posts_broadcast_update
  after update on public.transfer_posts
  referencing new table as changed_rows
  for each statement execute function public.broadcast_transfer_posts_change();

drop trigger if exists transfer_posts_broadcast_delete on public.transfer_posts;
create trigger transfer_posts_broadcast_delete
  after delete on public.transfer_posts
  referencing old table as changed_rows
  for each statement execute function public.broadcast_transfer_posts_change();

drop trigger if exists transfer_post_images_broadcast_insert on public.transfer_post_images;
create trigger transfer_post_images_broadcast_insert
  after insert on public.transfer_post_images
  referencing new table as changed_rows
  for each statement execute function public.broadcast_transfer_images_change();

drop trigger if exists transfer_post_images_broadcast_update on public.transfer_post_images;
create trigger transfer_post_images_broadcast_update
  after update on public.transfer_post_images
  referencing new table as changed_rows
  for each statement execute function public.broadcast_transfer_images_change();

drop trigger if exists transfer_post_images_broadcast_delete on public.transfer_post_images;
create trigger transfer_post_images_broadcast_delete
  after delete on public.transfer_post_images
  referencing old table as changed_rows
  for each statement execute function public.broadcast_transfer_images_change();

-- ---------------------------------------------------------------------
-- 5. Storage: cho phép khách tải ảnh lên nhưng chỉ trong thư mục "pass/".
--    Bucket đã giới hạn sẵn 5 MB và chỉ nhận JPG/PNG/WebP.
--    Khách không sửa hay xóa được file; dọn file thừa là việc của admin.
-- ---------------------------------------------------------------------
drop policy if exists "property-images: public insert pass" on storage.objects;
create policy "property-images: public insert pass"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = 'pass'
  );
