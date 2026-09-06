# Nhà trọ VinUni AI Thực Chiến – Website đăng tin cho thuê nhà/phòng

**Đang chạy tại:** https://aithucchiennhatro.vercel.app · **Quản trị:** https://aithucchiennhatro.vercel.app/admin

Website gồm hai khu vực tách biệt:

- **Trang công khai** cho khách thuê: bốn tab – `/` xem toàn bộ phòng, `/o-ghep` xem những phòng đang tìm bạn ở ghép, `/pass-phong` xem những phòng đang cần nhượng lại, `/pass-slot` xem những chỗ ở ghép đang cần nhượng lại. Lọc, xem chi tiết, gọi điện / nhắn Zalo. Không cần đăng ký hay đăng nhập.
- **Khách tự đăng tin** tại `/pass-phong/dang-tin` (pass cả phòng) và `/pass-slot/dang-tin` (pass một slot): không cần tài khoản, tin hiện ngay. Admin có quyền sửa, ẩn hoặc xóa các tin này.
- **Trang quản trị** tại `/admin`: bắt buộc đăng nhập, dùng để thêm, sửa, ẩn/hiện, xóa tin và quản lý ảnh.

Công nghệ: Next.js 16 (App Router, TypeScript), Tailwind CSS 4, Supabase (PostgreSQL + Auth + Storage + Realtime), triển khai trên Vercel. Toàn bộ đều dùng gói miễn phí.

---

## 1. Đổi tên thương hiệu và thông tin liên hệ

Mọi nội dung thương hiệu nằm trong **một file duy nhất**: [`src/config/site.ts`](src/config/site.ts).

| Muốn đổi | Sửa dòng |
| --- | --- |
| Tên website | `name` |
| Khẩu hiệu ở đầu trang | `tagline` |
| Đoạn giới thiệu ở đầu trang | `intro` |
| Mô tả cho Google / Facebook | `description` |
| Tên người liên hệ mặc định | `contact.name` |
| Số điện thoại hiển thị | `contact.phone` |
| Số dùng cho nút Gọi và Zalo | `contact.phoneRaw` (chỉ chữ số) |
| Địa chỉ, giờ nhận cuộc gọi | `contact.address`, `contact.hours` |
| Tỉnh/thành mặc định khi tạo tin | `defaultCity` |
| Danh sách tiện nghi gợi ý trong form | `amenitySuggestions` |
| Tiêu đề và lời giới thiệu tab Tìm bạn ở ghép | `roommate.title`, `roommate.intro` |
| Chữ trên nút đăng ký ở ghép | `roommate.signUpLabel` |
| Tên trường dùng làm mốc đo khoảng cách | `school.name`, `school.shortName` |
| Tiêu đề và lời giới thiệu tab Pass lại phòng | `transfer.title`, `transfer.intro` |
| Tiêu đề và lời giới thiệu tab Pass slot phòng | `slotTransfer.title`, `slotTransfer.intro` |

Sửa xong thì lưu file, chạy lại (`npm run dev`) hoặc đẩy lên Git để Vercel tự triển khai.

## 2. Chạy trên máy

```bash
npm install
cp .env.example .env.local   # rồi điền giá trị thật
npm run dev
```

Mở http://localhost:3000. Trang quản trị: http://localhost:3000/admin

### Biến môi trường

| Biến | Bắt buộc | Ý nghĩa | Nơi dùng |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Có | Địa chỉ project Supabase | Trình duyệt + server |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Có | Khóa công khai (`sb_publishable_…`). Có thể dùng `NEXT_PUBLIC_SUPABASE_ANON_KEY` thay thế | Trình duyệt + server |
| `NEXT_PUBLIC_SITE_URL` | Nên có | Địa chỉ production, dùng cho SEO và Open Graph | Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Không | **Chỉ dùng cho script trên máy bạn** (`create-admin`, `seed`). Tuyệt đối không đưa lên Vercel, không commit | Script cục bộ |

Khóa `NEXT_PUBLIC_*` là khóa công khai theo thiết kế của Supabase; mọi quyền truy cập đều bị Row Level Security chặn ở phía database.

## 3. Cấu hình Supabase

1. Tạo project miễn phí tại https://supabase.com/dashboard.
2. Liên kết thư mục này với project:
   ```bash
   npx supabase link --project-ref <ref-cua-ban>
   ```
3. Chạy migration (tạo bảng, RLS, Storage, trigger realtime):
   ```bash
   npx supabase db push
   ```
   Hoặc mở SQL Editor trên dashboard và dán toàn bộ nội dung
   [`supabase/migrations/20260904000000_init.sql`](supabase/migrations/20260904000000_init.sql).
4. Lấy `Project URL` và `Publishable key` tại **Project Settings → API Keys**, điền vào `.env.local`.

Migration đã tự tạo bucket `property-images` (công khai để đọc, chỉ admin được ghi) nên **không cần thao tác thủ công** trên dashboard.

## 4. Tạo tài khoản admin

Không tài khoản nào tự trở thành admin. Quyền admin được cấp bằng cách thêm một dòng vào bảng `admin_users`.

**Cách nhanh nhất** — thêm `SUPABASE_SERVICE_ROLE_KEY` vào `.env.local` rồi chạy:

```bash
npm run create-admin -- ban@example.com
```

Script tạo tài khoản (đã xác nhận email), in ra mật khẩu tạm một lần duy nhất, và cấp quyền admin. Nếu email đã tồn tại thì chỉ cấp quyền, không đổi mật khẩu. Muốn tự đặt mật khẩu:

```bash
npm run create-admin -- ban@example.com "MatKhauManh123!"
```

**Cách thủ công** (không cần service key): tạo user trong **Authentication → Users** trên dashboard, copy `User UID`, rồi chạy trong SQL Editor:

```sql
insert into public.admin_users (user_id) values ('<user-uid>');
```

Sau khi có admin, xóa `SUPABASE_SERVICE_ROLE_KEY` khỏi `.env.local` cho an toàn.

> Lưu ý: lệnh `npx supabase projects api-keys` che bớt khóa `sb_secret_…`. Nếu gặp lỗi *Invalid API key*, hãy lấy khóa `service_role` đầy đủ trong **Project Settings → API Keys** trên dashboard.

## 5. Dữ liệu mẫu

```bash
npm run seed            # thêm 4 tin mẫu, bỏ qua tin đã có
npm run seed -- --reset # xóa và tạo lại 4 tin mẫu
```

Ảnh mẫu nằm trong `supabase/seed-images/` (ảnh Unsplash, giấy phép cho dùng miễn phí). Thay ảnh bằng cách ghi đè các file `.webp` trong thư mục đó rồi chạy lại `npm run seed -- --reset`.

## 6. Kiểm tra chất lượng

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run test       # Vitest
npm run build      # Build production
npm run check      # lint + typecheck + test
```

## 7. Triển khai lên Vercel

```bash
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
npx vercel env add NEXT_PUBLIC_SITE_URL production
npx vercel --prod
```

Chỉ thêm ba biến `NEXT_PUBLIC_*`. **Không** thêm `SUPABASE_SERVICE_ROLE_KEY` lên Vercel.

Sau khi có tên miền `*.vercel.app`, cập nhật lại `NEXT_PUBLIC_SITE_URL` cho đúng rồi triển khai lại để SEO và Open Graph dùng đúng địa chỉ.

## 8. Cấu trúc thư mục

```
src/
  app/
    page.tsx                              Trang chủ (danh sách phòng)
    o-ghep/page.tsx                       Tab "Tìm bạn ở ghép"
    admin/(dashboard)/o-ghep/             Quản trị riêng phần ở ghép
    pass-phong/page.tsx                   Tab "Pass lại phòng"
    pass-phong/dang-tin/page.tsx          Form khách tự đăng tin pass phòng
    pass-phong/[slug]/page.tsx            Chi tiết một tin pass phòng
    pass-slot/page.tsx                    Tab "Pass slot phòng"
    pass-slot/dang-tin/page.tsx           Form khách tự đăng tin pass slot
    pass-slot/[slug]/page.tsx             Chi tiết một tin pass slot
    admin/(dashboard)/pass-phong/         Quản trị tin pass phòng
    admin/(dashboard)/pass-slot/          Quản trị tin pass slot
    phong/[slug]/page.tsx                 Trang chi tiết một phòng
    admin/login/page.tsx                  Đăng nhập quản trị
    admin/(dashboard)/page.tsx            Danh sách tin (quản trị)
    admin/(dashboard)/phong-moi/          Đăng tin mới
    admin/(dashboard)/phong/[id]/chinh-sua/  Sửa tin
  components/
    site/       Header, footer trang công khai
    listings/   Card, bộ lọc, gallery, nút liên hệ
    admin/      Form đăng tin, upload ảnh, bảng quản trị
    ui/         Nút, ô nhập, nhãn, hộp thoại xác nhận
  config/site.ts        Thương hiệu và liên hệ (sửa ở đây)
  lib/
    supabase/   Client trình duyệt, client server, proxy bảo vệ admin
    listings/   Schema Zod, truy vấn, Server Actions, xử lý ảnh
  hooks/        Realtime, cảnh báo thay đổi chưa lưu
  proxy.ts      Chặn người chưa đăng nhập vào /admin
supabase/
  migrations/   SQL tạo bảng, RLS, Storage, trigger realtime
  seed-images/  Ảnh mẫu
scripts/        Tạo admin, nạp dữ liệu mẫu
tests/          Kiểm thử đơn vị (Vitest)
```

## 9. Database và bảo mật

### Bảng

| Bảng | Nội dung |
| --- | --- |
| `properties` | Tin đăng: tiêu đề, địa chỉ, giá, cọc, điện, nước, phí dịch vụ, diện tích, số phòng, tầng, tiện nghi, mô tả, liên hệ, `is_available`, `is_published`, `slug` duy nhất, `created_at`, `updated_at`, `distance_to_school_km` (khoảng cách tới trường), và nhóm ở ghép `roommate_open`, `roommate_slot_price` (giá một chỗ/tháng), `roommate_gender` (phòng nam/nữ/cả hai), `roommate_male_count`, `roommate_female_count`, `roommate_note` |
| `property_images` | Ảnh của tin: `storage_path`, `url`, `sort_order`, `is_cover`. Xóa tin thì ảnh xóa theo |
| `transfer_posts` | Tin pass phòng do **khách tự đăng**: đủ thông tin phòng như trên, cộng thêm `contract_end_date` (ngày hết hạn hợp đồng), `deposit_months` (cọc 1 hay cọc 3 tháng), `distance_to_school_km`, `is_transferred` (đã pass xong chưa), `is_published`. Cột `kind` phân biệt hai loại: `room` là pass cả phòng, `slot` là pass một chỗ trong phòng (kèm `slot_count`, `room_gender`, `people_in_room`) |
| `transfer_post_images` | Ảnh của tin pass phòng. Xóa tin thì ảnh xóa theo |
| `admin_users` | Danh sách user được quyền quản trị, liên kết `auth.users` |

### Row Level Security

RLS bật trên cả ba bảng. Hàm `public.is_admin()` kiểm tra user hiện tại có trong `admin_users` không.

| Đối tượng | Được làm gì |
| --- | --- |
| Khách chưa đăng nhập | Với `properties`: chỉ **đọc** tin có `is_published = true` và ảnh của những tin đó. Với `transfer_posts`: đọc tin công khai và **thêm** tin mới, nhưng **không** sửa, không xóa |
| User đã đăng nhập nhưng không phải admin | Giống khách chưa đăng nhập |
| Admin | Đọc, thêm, sửa, xóa toàn bộ tin và ảnh |

Không có policy `INSERT` nào cho `admin_users`, nên **không tài khoản nào tự cấp quyền admin cho mình được**; chỉ service key (chạy trên máy bạn) hoặc SQL Editor mới thêm được admin.

Storage bucket `property-images`: ai cũng đọc được ảnh, chỉ admin được tải lên / sửa / xóa. Giới hạn 5 MB/ảnh, chỉ nhận JPG, PNG, WebP.

### Bảo vệ nhiều lớp

1. `src/proxy.ts` chuyển hướng người chưa đăng nhập khỏi `/admin`.
2. Layout `/admin` kiểm tra lại phiên đăng nhập và quyền admin ở phía server.
3. Mọi Server Action gọi `getClaims()` và `is_admin()` trước khi ghi dữ liệu.
4. RLS trong PostgreSQL chặn ở lớp cuối cùng, kể cả khi ai đó gọi thẳng API Supabase.

### Realtime

Trigger trong database gọi `realtime.send()` trên kênh công khai `listings` mỗi khi tin hoặc ảnh thay đổi. Payload chỉ chứa `{table, op, id}`; trình duyệt nhận được sẽ tự tải lại dữ liệu qua RLS, nên tin đang ẩn không bị lộ. Trang công khai còn tự làm mới khi cửa sổ được focus lại hoặc khi realtime kết nối lại, phòng khi mất kết nối.

## 10. Thay ảnh, số điện thoại, thông tin phòng

- **Số điện thoại / Zalo / tên thương hiệu**: sửa `src/config/site.ts`.
- **Ảnh và thông tin từng phòng**: đăng nhập `/admin` → bấm **Sửa** ở tin cần đổi → kéo thả ảnh mới, bấm ngôi sao để chọn ảnh đại diện, mũi tên để sắp xếp, thùng rác để xóa → **Lưu thay đổi**.
- **Ẩn tin tạm thời**: bấm **Ẩn tin** trong danh sách quản trị. Tin biến mất khỏi trang khách ngay lập tức.
- **Đánh dấu đã cho thuê**: bấm **Đánh dấu đã cho thuê**. Tin vẫn hiển thị nhưng có nhãn rõ ràng và nút liên hệ bị vô hiệu hóa.

## 11. Tab "Tìm bạn ở ghép"

Tab này ở địa chỉ `/o-ghep`, chỉ hiện những phòng được bật chế độ tìm bạn ở ghép.
Khác với tab "Tất cả phòng", ở đây giá hiển thị là **giá một chỗ mỗi tháng**, không phải giá cả phòng.

Thẻ phòng ở tab này **chỉ hiện giá một chỗ**, không bao giờ hiện giá cả phòng. Phòng chưa nhập giá
chỗ sẽ ghi "Liên hệ để biết giá một chỗ" thay vì lấy giá phòng làm dự phòng.

Mỗi thẻ phòng còn cho biết **phòng dành cho nam hay nữ**, **khoảng cách tới trường**, nhãn
**"Đã có: 2 nam"** cho biết ai đang ở trong phòng,
và có nút **Đăng ký ở ghép** mở thẳng Zalo của bạn. Nút này xuất hiện cả ngoài danh sách lẫn trong
trang chi tiết. Số Zalo lấy từ `contact.phoneRaw` trong `src/config/site.ts`.

### Quản lý ở ghép

Vào **`/admin/o-ghep`** (nút "Tìm bạn ở ghép" trên thanh quản trị). Đây là tab riêng chỉ để chỉnh
phần ở ghép, không đụng tới giá phòng, ảnh hay mô tả.

| Trường | Ý nghĩa |
| --- | --- |
| Phòng này đang tìm bạn ở ghép | Bật thì tin mới hiện ở tab `/o-ghep` |
| Giá một chỗ ở ghép / tháng | Số tiền hiện trên thẻ phòng ở tab ghép, thay cho giá cả phòng |
| Phòng dành cho | Phòng nam, Phòng nữ, hoặc Nam hoặc nữ |
| Số bạn nam / nữ đang ở | Hiện trên nhãn "Ở ghép: …" |
| Khoảng cách tới trường (km) | Dùng chung, hiện ở cả ba tab |
| Ghi chú | Thói quen, giờ giấc, yêu cầu riêng |

Danh sách có bộ lọc nhanh **Đang tìm ghép / Chưa bật / Thiếu giá chỗ**, nút bật tắt nhanh, và cảnh
báo đỏ với phòng đã bật ghép nhưng chưa nhập giá một chỗ.

Thông tin ở ghép chỉ xuất hiện ở tab `/o-ghep`. Tab "Tất cả phòng" ở trang chủ giữ nguyên là nơi
xem phòng cho thuê nguyên căn, không hiện nhãn ở ghép nào.

## 12. Tab "Pass lại phòng"

Tab này ở địa chỉ `/pass-phong`, dành cho người đang thuê muốn nhượng lại phòng của mình.

**Khách đăng tin:** bấm nút **Đăng tin pass phòng** trên tab đó (hoặc vào thẳng `/pass-phong/dang-tin`).
Không cần tài khoản. Ngoài thông tin phòng như tin cho thuê bình thường, form bắt buộc hai mục:

- **Ngày hết hạn hợp đồng** hiện tại (không nhận ngày đã qua).
- **Mức cọc người nhận phải đóng:** cọc 1 tháng hoặc cọc 3 tháng.

Hai thông tin này hiện ngay trên thẻ tin và trang chi tiết để người xem quyết định nhanh.

**Admin quản lý:** vào `/admin/pass-phong`. Ở đây xem được cả tin đã ẩn, tìm kiếm theo tiêu đề,
địa chỉ, tên hoặc số điện thoại người đăng, và với mỗi tin có thể **Sửa**, **Đánh dấu đã pass xong**,
**Ẩn tin** hoặc **Xóa**.

### Chống spam

Vì ai cũng đăng được tin nên form có ba lớp chặn cơ bản: một ô ẩn mà chỉ bot mới điền, chặn gửi
nhanh dưới 3 giây, và toàn bộ dữ liệu được kiểm tra hai lần (trình duyệt và server) cộng với ràng buộc
ngay trong database. Đây là mức đủ cho quy mô nhỏ; nếu sau này bị spam nhiều, bước tiếp theo nên làm
là bắt tin chờ admin duyệt trước khi hiển thị.

## 13. Khoảng cách tới trường

Mỗi phòng và mỗi tin pass phòng có một ô **Khoảng cách tới trường (km)**, nhập số thập phân được
(ví dụ `1.2`). Để trống nếu chưa đo. Giao diện tự đổi cách hiển thị: dưới 1 km ghi theo mét
("800 m"), từ 1 km trở lên ghi theo km ("1,2 km"). Nhãn này hiện trên thẻ phòng ở cả ba tab và
trong bảng thông số ở trang chi tiết.

Đổi tên trường ở `school.name` và `school.shortName` trong `src/config/site.ts`.

## 14. Tab "Pass slot phòng"

Tab này ở địa chỉ `/pass-slot`, dành cho bạn **đang ở ghép** và muốn nhượng lại **chỗ của mình**
trong một phòng đã có người ở. Khác với `/pass-phong` là nhượng cả phòng.

**Khách đăng tin:** bấm **Đăng tin pass slot** trên tab đó (hoặc vào `/pass-slot/dang-tin`).
Các trường giống hệt tin pass phòng — hạn hợp đồng, mức cọc 1 hay 3 tháng, chi phí điện nước dịch
vụ, ảnh, liên hệ — cộng thêm một khối riêng ở đầu form:

| Trường | Ý nghĩa |
| --- | --- |
| Số slot muốn pass lại | Bắt buộc, từ 1 tới 10 |
| Số người đang ở trong phòng | Không tính người đăng, để người xem biết sẽ ở cùng mấy bạn |
| Phòng dành cho | Phòng nam, Phòng nữ, hoặc Nam hoặc nữ |

Giá ở tab này là **giá một slot mỗi tháng**, hiển thị kèm đuôi "/slot/tháng" để không lẫn với giá
cả phòng bên tab pass phòng.

**Admin quản lý:** vào `/admin/pass-slot`, thao tác giống hệt trang tin pass phòng (sửa, đánh dấu đã
pass xong, ẩn, xóa).

### Ghi chú kỹ thuật

Hai loại tin dùng chung bảng `transfer_posts`, phân biệt bằng cột `kind` (`room` hoặc `slot`). Nhờ
vậy RLS, Realtime, Storage và phần lớn giao diện dùng lại được, không phải nhân đôi. Cột `price`
mang nghĩa "số tiền người nhận trả mỗi tháng": với `room` là tiền cả phòng, với `slot` là tiền một
chỗ.
