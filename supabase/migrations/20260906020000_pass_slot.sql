-- =====================================================================
-- Tính năng "Pass slot phòng"
-- Người đang ở ghép muốn nhượng lại CHỖ CỦA MÌNH trong một phòng đã có
-- người ở, khác với pass cả phòng.
--
-- Dùng chung bảng transfer_posts và thêm cột phân loại `kind`:
--   'room' = pass cả phòng (tính năng cũ)
--   'slot' = pass slot của bản thân trong phòng
-- Nhờ vậy RLS, Realtime, Storage và trang quản trị dùng lại được toàn bộ.
--
-- Ý nghĩa cột `price` theo từng loại:
--   kind = 'room' -> tiền thuê cả phòng mỗi tháng
--   kind = 'slot' -> tiền một slot mỗi tháng
-- Cả hai đều là "số tiền người nhận phải trả hằng tháng" nên bộ lọc giá
-- và cách hiển thị dùng chung được.
-- Chạy bằng: npx supabase db push
-- =====================================================================

alter table public.transfer_posts
  add column if not exists kind text not null default 'room',
  -- Số slot muốn pass lại (chỉ dùng khi kind = 'slot')
  add column if not exists slot_count smallint,
  -- Phòng dành cho nam, nữ hay cả hai
  add column if not exists room_gender text not null default 'any',
  -- Số người hiện đang ở trong phòng, để người nhận biết sẽ ở cùng ai
  add column if not exists people_in_room smallint not null default 0;

alter table public.transfer_posts
  drop constraint if exists transfer_posts_kind_check;
alter table public.transfer_posts
  add constraint transfer_posts_kind_check check (kind in ('room', 'slot'));

alter table public.transfer_posts
  drop constraint if exists transfer_posts_room_gender_check;
alter table public.transfer_posts
  add constraint transfer_posts_room_gender_check check (room_gender in ('male', 'female', 'any'));

alter table public.transfer_posts
  drop constraint if exists transfer_posts_people_in_room_check;
alter table public.transfer_posts
  add constraint transfer_posts_people_in_room_check check (people_in_room between 0 and 20);

-- Tin pass slot bắt buộc có số slot hợp lệ; tin pass cả phòng thì bỏ trống
alter table public.transfer_posts
  drop constraint if exists transfer_posts_slot_count_check;
alter table public.transfer_posts
  add constraint transfer_posts_slot_count_check check (
    (kind = 'slot' and slot_count is not null and slot_count between 1 and 10)
    or (kind = 'room' and slot_count is null)
  );

create index if not exists transfer_posts_kind_idx
  on public.transfer_posts (kind, is_published, is_transferred, updated_at desc);

comment on column public.transfer_posts.kind is 'room = pass cả phòng, slot = pass slot của bản thân trong phòng';
comment on column public.transfer_posts.slot_count is 'Số slot muốn pass lại, chỉ dùng khi kind = slot';
comment on column public.transfer_posts.room_gender is 'Phòng dành cho: male = nam, female = nữ, any = nam hoặc nữ';
comment on column public.transfer_posts.people_in_room is 'Số người hiện đang ở trong phòng';
comment on column public.transfer_posts.price is 'kind = room: tiền thuê cả phòng/tháng. kind = slot: tiền một slot/tháng';

-- RLS, Realtime và Storage dùng chung với tin pass phòng nên không khai báo thêm.
