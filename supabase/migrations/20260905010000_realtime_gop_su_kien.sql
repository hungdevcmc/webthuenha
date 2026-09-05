-- =====================================================================
-- Gộp sự kiện Realtime
-- Trước đây trigger chạy theo TỪNG DÒNG: lưu một tin có 9 ảnh sẽ sinh ra
-- 9 sự kiện ảnh, mỗi sự kiện lại cập nhật properties.updated_at và sinh
-- tiếp 9 sự kiện tin -> hàng chục sự kiện cho một lần bấm Lưu.
-- Giờ chuyển sang trigger theo CÂU LỆNH: mỗi lần lưu chỉ phát 1-2 sự kiện.
-- Chạy bằng: npx supabase db push
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Cập nhật updated_at của tin khi ảnh thay đổi (gộp theo câu lệnh)
-- ---------------------------------------------------------------------
create or replace function public.touch_properties_from_images()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.properties p
  set updated_at = now()
  where p.id in (select c.property_id from changed_rows c);
  return null;
end;
$$;

drop trigger if exists property_images_touch on public.property_images;
drop trigger if exists property_images_touch_insert on public.property_images;
drop trigger if exists property_images_touch_update on public.property_images;
drop trigger if exists property_images_touch_delete on public.property_images;

create trigger property_images_touch_insert
  after insert on public.property_images
  referencing new table as changed_rows
  for each statement execute function public.touch_properties_from_images();

create trigger property_images_touch_update
  after update on public.property_images
  referencing new table as changed_rows
  for each statement execute function public.touch_properties_from_images();

create trigger property_images_touch_delete
  after delete on public.property_images
  referencing old table as changed_rows
  for each statement execute function public.touch_properties_from_images();

-- ---------------------------------------------------------------------
-- 2. Broadcast realtime (gộp theo câu lệnh, mỗi tin bị ảnh hưởng 1 sự kiện)
-- ---------------------------------------------------------------------
create or replace function public.broadcast_properties_change()
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
      jsonb_build_object('table', 'properties', 'op', tg_op, 'id', r.id::text),
      'change',
      'listings',
      false
    );
  end loop;
  return null;
end;
$$;

create or replace function public.broadcast_images_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
begin
  for r in select distinct c.property_id from changed_rows c loop
    perform realtime.send(
      jsonb_build_object('table', 'property_images', 'op', tg_op, 'id', r.property_id::text),
      'change',
      'listings',
      false
    );
  end loop;
  return null;
end;
$$;

drop trigger if exists properties_broadcast on public.properties;
drop trigger if exists properties_broadcast_insert on public.properties;
drop trigger if exists properties_broadcast_update on public.properties;
drop trigger if exists properties_broadcast_delete on public.properties;

create trigger properties_broadcast_insert
  after insert on public.properties
  referencing new table as changed_rows
  for each statement execute function public.broadcast_properties_change();

create trigger properties_broadcast_update
  after update on public.properties
  referencing new table as changed_rows
  for each statement execute function public.broadcast_properties_change();

create trigger properties_broadcast_delete
  after delete on public.properties
  referencing old table as changed_rows
  for each statement execute function public.broadcast_properties_change();

drop trigger if exists property_images_broadcast on public.property_images;
drop trigger if exists property_images_broadcast_insert on public.property_images;
drop trigger if exists property_images_broadcast_update on public.property_images;
drop trigger if exists property_images_broadcast_delete on public.property_images;

create trigger property_images_broadcast_insert
  after insert on public.property_images
  referencing new table as changed_rows
  for each statement execute function public.broadcast_images_change();

create trigger property_images_broadcast_update
  after update on public.property_images
  referencing new table as changed_rows
  for each statement execute function public.broadcast_images_change();

create trigger property_images_broadcast_delete
  after delete on public.property_images
  referencing old table as changed_rows
  for each statement execute function public.broadcast_images_change();

-- Hàm cũ chạy theo dòng không còn trigger nào dùng
drop function if exists public.broadcast_listing_change();
drop function if exists public.touch_property_from_image();
