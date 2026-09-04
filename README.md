# Nhà Trọ An Tâm – Website đăng tin cho thuê nhà/phòng

Website gồm hai khu vực tách biệt:

- **Trang công khai** cho khách thuê: xem danh sách phòng, lọc, xem chi tiết, gọi điện / nhắn Zalo. Không cần đăng ký hay đăng nhập.
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
| `properties` | Tin đăng: tiêu đề, địa chỉ, giá, cọc, điện, nước, phí dịch vụ, diện tích, số phòng, tầng, tiện nghi, mô tả, liên hệ, `is_available`, `is_published`, `slug` duy nhất, `created_at`, `updated_at` |
| `property_images` | Ảnh của tin: `storage_path`, `url`, `sort_order`, `is_cover`. Xóa tin thì ảnh xóa theo |
| `admin_users` | Danh sách user được quyền quản trị, liên kết `auth.users` |

### Row Level Security

RLS bật trên cả ba bảng. Hàm `public.is_admin()` kiểm tra user hiện tại có trong `admin_users` không.

| Đối tượng | Được làm gì |
| --- | --- |
| Khách chưa đăng nhập | Chỉ **đọc** tin có `is_published = true` và ảnh của những tin đó |
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
