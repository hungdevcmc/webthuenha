#!/usr/bin/env node
/**
 * Nạp dữ liệu mẫu (4 tin + ảnh trong supabase/seed-images) để kiểm tra giao diện.
 *
 *   node scripts/seed.mjs            # thêm nếu chưa có (bỏ qua slug đã tồn tại)
 *   node scripts/seed.mjs --reset    # xóa toàn bộ tin mẫu theo slug rồi tạo lại
 *
 * Cần NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env.local.
 * Ảnh mẫu lấy từ Unsplash (giấy phép Unsplash: dùng miễn phí, không cần ghi nguồn).
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}
const reset = process.argv.includes("--reset");
const BUCKET = "property-images";
const IMAGE_DIR = path.resolve(process.cwd(), "supabase/seed-images");

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

const contact = { contact_name: "Anh Hưng (chủ nhà)", contact_phone: "0901234567", contact_zalo: "0901234567" };

const samples = [
  {
    slug: "phong-tro-25m2-co-gac-gan-lotte-mart-quan-7",
    title: "Phòng trọ 25 m² có gác lửng, gần Lotte Mart Quận 7",
    address: "Hẻm 793 Trần Xuân Soạn, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh",
    district: "Quận 7",
    city: "Thành phố Hồ Chí Minh",
    price: 3_500_000,
    deposit: 3_500_000,
    electricity_price: 3_800,
    electricity_unit: "kWh",
    water_price: 100_000,
    water_unit: "người/tháng",
    service_fee: 150_000,
    service_fee_included: false,
    area_m2: 25,
    bedrooms: 1,
    bathrooms: 1,
    floor: 2,
    total_floors: 4,
    amenities: ["Máy lạnh", "Máy nước nóng", "Giường", "Tủ quần áo", "Cửa sổ thoáng", "Wifi", "Chỗ để xe", "Camera an ninh", "Giờ giấc tự do"],
    description:
      "Phòng mới sơn sửa, có gác lửng rộng để ngủ, dưới là góc làm việc và bếp nhỏ. Cửa sổ hướng Đông đón nắng sáng, rất thoáng.\n\nKhu trọ có khóa vân tay, camera hành lang, giờ giấc tự do. Đi bộ 5 phút tới Lotte Mart, chợ Tân Mỹ và trạm xe buýt. Phù hợp 1–2 người đi làm.\n\nPhí dịch vụ 150.000đ/tháng gồm rác, wifi và vệ sinh khu chung.",
    is_available: true,
    is_published: true,
    images: ["phong-tro-1.webp", "phong-tro-2.webp", "phong-tro-3.webp"],
  },
  {
    slug: "can-ho-mini-1-phong-ngu-full-noi-that-phu-nhuan",
    title: "Căn hộ mini 1 phòng ngủ đầy đủ nội thất, Phú Nhuận",
    address: "112/8 Phan Đăng Lưu, Phường 3, Quận Phú Nhuận, TP. Hồ Chí Minh",
    district: "Phú Nhuận",
    city: "Thành phố Hồ Chí Minh",
    price: 6_200_000,
    deposit: 6_200_000,
    electricity_price: 3_500,
    electricity_unit: "kWh",
    water_price: 25_000,
    water_unit: "m³",
    service_fee: 200_000,
    service_fee_included: true,
    area_m2: 38,
    bedrooms: 1,
    bathrooms: 1,
    floor: 3,
    total_floors: 6,
    amenities: ["Máy lạnh", "Máy nước nóng", "Tủ lạnh", "Máy giặt", "Giường", "Nệm", "Tủ quần áo", "Bàn làm việc", "Bếp riêng", "Ban công", "Wifi", "Thang máy", "Chỗ để xe", "Bảo vệ 24/7"],
    description:
      "Căn hộ mini tách biệt phòng ngủ và phòng khách, ban công riêng nhìn ra đường Phan Đăng Lưu. Nội thất đầy đủ, chỉ cần mang vali vào ở.\n\nTòa nhà có thang máy, bảo vệ 24/7, hầm xe rộng. Cách sân bay 10 phút, cách trung tâm Quận 1 15 phút.\n\nGiá thuê đã bao gồm phí dịch vụ (rác, wifi, thang máy, vệ sinh chung). Hợp đồng tối thiểu 6 tháng.",
    is_available: true,
    is_published: true,
    images: ["can-ho-mini-1.webp", "can-ho-mini-2.webp", "can-ho-mini-3.webp"],
  },
  {
    slug: "nha-nguyen-can-3-phong-ngu-hem-xe-hoi-go-vap",
    title: "Nhà nguyên căn 3 phòng ngủ, hẻm xe hơi, Gò Vấp",
    address: "45/12 Nguyễn Văn Khối, Phường 9, Quận Gò Vấp, TP. Hồ Chí Minh",
    district: "Gò Vấp",
    city: "Thành phố Hồ Chí Minh",
    price: 12_000_000,
    deposit: 24_000_000,
    electricity_price: 0,
    electricity_unit: "kWh",
    water_price: 0,
    water_unit: "m³",
    service_fee: 0,
    service_fee_included: true,
    area_m2: 96,
    bedrooms: 3,
    bathrooms: 2,
    floor: null,
    total_floors: 3,
    amenities: ["Máy lạnh", "Máy nước nóng", "Bếp riêng", "Kệ bếp", "Ban công", "Cửa sổ thoáng", "Chỗ để xe", "Nuôi thú cưng", "Giờ giấc tự do"],
    description:
      "Nhà 1 trệt 2 lầu, 3 phòng ngủ, 2 nhà vệ sinh, sân trước để được 2 xe máy và 1 ô tô nhỏ. Hẻm xe hơi thông thoáng, an ninh, dân trí cao.\n\nĐiện nước khách tự đóng theo hóa đơn nhà nước, không phí dịch vụ. Cho phép nuôi thú cưng. Phù hợp gia đình hoặc nhóm bạn 4–6 người.\n\nCọc 2 tháng, hợp đồng 1 năm, có thể thương lượng khi xem nhà.",
    is_available: true,
    is_published: true,
    images: ["nha-nguyen-can-1.webp", "nha-nguyen-can-2.webp", "nha-nguyen-can-3.webp", "nha-nguyen-can-4.webp"],
  },
  {
    slug: "can-ho-2-phong-ngu-view-song-quan-4",
    title: "Căn hộ 2 phòng ngủ view sông, Quận 4",
    address: "Chung cư Galaxy 9, 9 Nguyễn Khoái, Phường 1, Quận 4, TP. Hồ Chí Minh",
    district: "Quận 4",
    city: "Thành phố Hồ Chí Minh",
    price: 14_500_000,
    deposit: 29_000_000,
    electricity_price: 3_200,
    electricity_unit: "kWh",
    water_price: 18_000,
    water_unit: "m³",
    service_fee: 600_000,
    service_fee_included: false,
    area_m2: 68,
    bedrooms: 2,
    bathrooms: 2,
    floor: 12,
    total_floors: 20,
    amenities: ["Máy lạnh", "Máy nước nóng", "Tủ lạnh", "Máy giặt", "Giường", "Nệm", "Tủ quần áo", "Bếp riêng", "Ban công", "Thang máy", "Chỗ để xe", "Bảo vệ 24/7", "Camera an ninh"],
    description:
      "Căn hộ tầng 12 hướng sông, 2 phòng ngủ 2 nhà vệ sinh, nội thất cao cấp. Chung cư có hồ bơi, phòng gym, siêu thị dưới sảnh.\n\nPhí quản lý 600.000đ/tháng đóng riêng cho ban quản lý. Cách Quận 1 5 phút qua cầu Calmette.",
    is_available: false,
    is_published: true,
    images: ["can-ho-2pn-1.webp", "can-ho-2pn-2.webp", "can-ho-2pn-3.webp"],
  },
];

async function uploadSeedImage(fileName) {
  const filePath = path.join(IMAGE_DIR, fileName);
  const buffer = fs.readFileSync(filePath);
  const storagePath = `seed/${fileName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(`Upload ${fileName}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { storage_path: storagePath, url: data.publicUrl };
}

for (const sample of samples) {
  const { images, ...fields } = sample;
  const { data: existing } = await supabase.from("properties").select("id").eq("slug", sample.slug).maybeSingle();

  if (existing && !reset) {
    console.log(`↷ Bỏ qua (đã có): ${sample.title}`);
    continue;
  }
  if (existing && reset) {
    await supabase.from("properties").delete().eq("id", existing.id);
  }

  const { data: property, error } = await supabase
    .from("properties")
    .insert({ ...contact, ...fields })
    .select("id")
    .single();
  if (error) {
    console.error(`✖ ${sample.title}: ${error.message}`);
    continue;
  }

  const rows = [];
  for (let i = 0; i < images.length; i++) {
    const uploaded = await uploadSeedImage(images[i]);
    rows.push({ property_id: property.id, ...uploaded, sort_order: i, is_cover: i === 0 });
  }
  const { error: imgError } = await supabase.from("property_images").insert(rows);
  if (imgError) console.error(`  ✖ ảnh: ${imgError.message}`);
  console.log(`✔ ${sample.title} (${rows.length} ảnh)`);
}

console.log("Xong.");
