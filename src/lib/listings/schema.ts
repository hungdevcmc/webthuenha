import { z } from "zod";

const requiredText = (label: string, max = 200) =>
  z
    .string({ error: `Vui lòng nhập ${label}` })
    .trim()
    .min(1, `Vui lòng nhập ${label}`)
    .max(max, `${label} tối đa ${max} ký tự`);

const money = (label: string) =>
  z
    .number({ error: `Vui lòng nhập ${label}` })
    .int(`${label} phải là số nguyên`)
    .min(0, `${label} không được âm`)
    .max(1_000_000_000_000, `${label} quá lớn`);

const smallInt = (label: string, max: number) =>
  z
    .number({ error: `Vui lòng nhập ${label}` })
    .int(`${label} phải là số nguyên`)
    .min(0, `${label} không được âm`)
    .max(max, `${label} tối đa ${max}`);

const optionalSmallInt = (label: string, max: number) =>
  z
    .number({ error: `${label} phải là số` })
    .int(`${label} phải là số nguyên`)
    .min(0, `${label} không được âm`)
    .max(max, `${label} tối đa ${max}`)
    .nullable();

const phoneRegex = /^(\+84|0)\d{8,10}$/;

/** Phòng dành cho giới tính nào */
export const ROOMMATE_GENDERS = ["any", "male", "female"] as const;
export type RoommateGender = (typeof ROOMMATE_GENDERS)[number];

/** Khoảng cách tới trường: km, cho phép để trống hoặc không gửi lên */
export const distanceField = z
  .number({ error: "Khoảng cách phải là số" })
  .min(0, "Khoảng cách không được âm")
  .max(500, "Khoảng cách tối đa 500 km")
  .nullable()
  .default(null);

export const listingImageSchema = z.object({
  id: z.uuid().optional(),
  storage_path: z.string().min(1).max(500),
  url: z.url().max(1000),
  sort_order: z.number().int().min(0),
  is_cover: z.boolean(),
});

const listingBaseSchema = z.object({
  title: requiredText("tiêu đề", 150),
  address: requiredText("địa chỉ", 300),
  district: requiredText("khu vực (quận/huyện)", 100),
  city: requiredText("tỉnh/thành phố", 100),
  price: money("giá thuê").min(1, "Giá thuê phải lớn hơn 0"),
  deposit: money("tiền đặt cọc"),
  electricity_price: money("giá điện"),
  electricity_unit: requiredText("đơn vị tính điện", 30),
  water_price: money("giá nước"),
  water_unit: requiredText("đơn vị tính nước", 30),
  service_fee: money("phí dịch vụ"),
  service_fee_included: z.boolean(),
  area_m2: z
    .number({ error: "Vui lòng nhập diện tích" })
    .min(1, "Diện tích phải lớn hơn 0")
    .max(10_000, "Diện tích quá lớn"),
  bedrooms: smallInt("số phòng ngủ", 20),
  bathrooms: smallInt("số nhà vệ sinh", 20),
  floor: optionalSmallInt("tầng", 200),
  total_floors: optionalSmallInt("tổng số tầng", 200),
  amenities: z.array(z.string().trim().min(1).max(60)).max(50, "Tối đa 50 tiện nghi"),
  description: z
    .string({ error: "Vui lòng nhập mô tả" })
    .trim()
    .min(20, "Mô tả nên có ít nhất 20 ký tự")
    .max(5000, "Mô tả tối đa 5000 ký tự"),
  contact_name: requiredText("tên người liên hệ", 100),
  contact_phone: z
    .string({ error: "Vui lòng nhập số điện thoại" })
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(phoneRegex, "Số điện thoại không hợp lệ (ví dụ 0901234567)")),
  contact_zalo: z
    .string()
    .trim()
    .max(200, "Zalo tối đa 200 ký tự")
    .nullable()
    .transform((v) => (v ? v : null)),
  is_available: z.boolean(),
  is_published: z.boolean(),
  roommate_open: z.boolean(),
  roommate_male_count: smallInt("số bạn nam ở ghép", 20),
  roommate_female_count: smallInt("số bạn nữ ở ghép", 20),
  roommate_note: z
    .string()
    .trim()
    .max(500, "Ghi chú ở ghép tối đa 500 ký tự")
    .transform((v) => v ?? ""),
  roommate_slot_price: money("giá một chỗ ở ghép").default(0),
  roommate_gender: z.enum(ROOMMATE_GENDERS, { error: "Vui lòng chọn phòng dành cho ai" }).default("any"),
  distance_to_school_km: distanceField,
  images: z.array(listingImageSchema).max(20, "Tối đa 20 ảnh"),
});

export const listingSchema = listingBaseSchema.check((ctx) => {
  const v = ctx.value;
  // Số người đang ở có thể bằng 0: phòng trống hoàn toàn vẫn cần tìm người ghép.
  // Tab ở ghép hiển thị giá theo chỗ nên bắt buộc phải có giá này
  if (v.roommate_open && v.roommate_slot_price <= 0) {
    ctx.issues.push({
      code: "custom",
      input: v.roommate_slot_price,
      path: ["roommate_slot_price"],
      message: "Nhập giá một chỗ ở ghép mỗi tháng",
    });
  }
});

/** Chỉ các trường liên quan tới ở ghép, dùng cho trang quản trị riêng của tab ở ghép */
export const roommateSchema = z
  .object({
    roommate_open: listingBaseSchema.shape.roommate_open,
    roommate_slot_price: listingBaseSchema.shape.roommate_slot_price,
    roommate_gender: listingBaseSchema.shape.roommate_gender,
    roommate_male_count: listingBaseSchema.shape.roommate_male_count,
    roommate_female_count: listingBaseSchema.shape.roommate_female_count,
    roommate_note: listingBaseSchema.shape.roommate_note,
    distance_to_school_km: listingBaseSchema.shape.distance_to_school_km,
  })
  .check((ctx) => {
    const v = ctx.value;
    // Số người đang ở có thể bằng 0, chỉ giá một chỗ là bắt buộc
    if (v.roommate_open && v.roommate_slot_price <= 0) {
      ctx.issues.push({
        code: "custom",
        input: v.roommate_slot_price,
        path: ["roommate_slot_price"],
        message: "Nhập giá một chỗ ở ghép mỗi tháng",
      });
    }
  });

export type RoommateFormInput = z.input<typeof roommateSchema>;
export type RoommateFormValues = z.output<typeof roommateSchema>;

/** Giá trị người dùng nhập trong form (trước khi transform) */
export type ListingFormInput = z.input<typeof listingSchema>;
/** Giá trị sau khi validate (dùng để lưu) */
export type ListingFormValues = z.output<typeof listingSchema>;
export type ListingImageInput = z.output<typeof listingImageSchema>;

export const ELECTRICITY_UNITS = ["kWh", "người/tháng", "phòng/tháng"] as const;
export const WATER_UNITS = ["m³", "người/tháng", "phòng/tháng"] as const;

/** Giới hạn upload ảnh */
export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_MAX_COUNT = 20;
