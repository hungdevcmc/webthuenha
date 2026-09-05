-- =====================================================================
-- Tính năng "Tìm bạn ở ghép"
-- Mỗi tin có thể bật chế độ tìm bạn ở ghép, kèm số người sẵn sàng ở ghép
-- theo giới tính và một ghi chú ngắn.
-- Chạy bằng: npx supabase db push
-- =====================================================================

alter table public.properties
  add column if not exists roommate_open boolean not null default false,
  add column if not exists roommate_male_count smallint not null default 0,
  add column if not exists roommate_female_count smallint not null default 0,
  add column if not exists roommate_note text not null default '';

-- Ràng buộc giá trị hợp lệ (đặt riêng để chạy lại migration không lỗi)
alter table public.properties
  drop constraint if exists properties_roommate_check;

alter table public.properties
  add constraint properties_roommate_check check (
    roommate_male_count between 0 and 20
    and roommate_female_count between 0 and 20
    and char_length(roommate_note) <= 500
  );

-- Tăng tốc truy vấn danh sách phòng đang tìm bạn ở ghép
create index if not exists properties_roommate_idx
  on public.properties (roommate_open, is_published, updated_at desc);

comment on column public.properties.roommate_open is 'Tin này có đang tìm bạn ở ghép không';
comment on column public.properties.roommate_male_count is 'Số bạn nam sẵn sàng ở ghép';
comment on column public.properties.roommate_female_count is 'Số bạn nữ sẵn sàng ở ghép';
comment on column public.properties.roommate_note is 'Ghi chú thêm về việc ở ghép (giờ giấc, thói quen...)';

-- RLS và Realtime dùng chung với bảng properties nên không cần khai báo thêm.
