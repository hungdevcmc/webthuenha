-- =====================================================================
-- Nâng cấp "Tìm bạn ở ghép" và bổ sung khoảng cách tới trường
--   1. Giá một slot ở ghép mỗi tháng (tab ở ghép hiện giá này thay vì giá cả phòng)
--   2. Phòng dành cho nam, cho nữ hay cả hai
--   3. Khoảng cách tới trường, thêm cho cả tin cho thuê lẫn tin pass phòng
-- Chạy bằng: npx supabase db push
-- =====================================================================

alter table public.properties
  add column if not exists roommate_slot_price bigint not null default 0,
  add column if not exists roommate_gender text not null default 'any',
  add column if not exists distance_to_school_km numeric(5, 2);

alter table public.transfer_posts
  add column if not exists distance_to_school_km numeric(5, 2);

-- Ràng buộc đặt riêng để chạy lại migration không lỗi
alter table public.properties
  drop constraint if exists properties_roommate_slot_price_check;
alter table public.properties
  add constraint properties_roommate_slot_price_check
  check (roommate_slot_price >= 0 and roommate_slot_price <= 1000000000000);

alter table public.properties
  drop constraint if exists properties_roommate_gender_check;
alter table public.properties
  add constraint properties_roommate_gender_check
  check (roommate_gender in ('male', 'female', 'any'));

alter table public.properties
  drop constraint if exists properties_distance_school_check;
alter table public.properties
  add constraint properties_distance_school_check
  check (distance_to_school_km is null or (distance_to_school_km >= 0 and distance_to_school_km <= 500));

alter table public.transfer_posts
  drop constraint if exists transfer_posts_distance_school_check;
alter table public.transfer_posts
  add constraint transfer_posts_distance_school_check
  check (distance_to_school_km is null or (distance_to_school_km >= 0 and distance_to_school_km <= 500));

comment on column public.properties.roommate_slot_price is 'Giá một chỗ ở ghép mỗi tháng (VND). 0 nghĩa là chưa đặt, giao diện sẽ hiện giá cả phòng';
comment on column public.properties.roommate_gender is 'Phòng dành cho: male = nam, female = nữ, any = nam hoặc nữ';
comment on column public.properties.distance_to_school_km is 'Khoảng cách tới trường theo km, để trống nếu chưa đo';
comment on column public.transfer_posts.distance_to_school_km is 'Khoảng cách tới trường theo km, để trống nếu chưa đo';

-- RLS và Realtime dùng chung với bảng gốc nên không cần khai báo thêm.
