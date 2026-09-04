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

export const listingImageSchema = z.object({
  id: z.uuid().optional(),
  storage_path: z.string().min(1).max(500),
  url: z.url().max(1000),
  sort_order: z.number().int().min(0),
  is_cover: z.boolean(),
});

export const listingSchema = z.object({
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
  images: z.array(listingImageSchema).max(20, "Tối đa 20 ảnh"),
});

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
