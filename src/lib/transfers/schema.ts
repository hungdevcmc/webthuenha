import { z } from "zod";
import { listingImageSchema } from "@/lib/listings/schema";

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

/** Số tháng tiền cọc mà người nhận phòng phải đóng */
export const DEPOSIT_MONTHS = [1, 3] as const;
export type DepositMonths = (typeof DEPOSIT_MONTHS)[number];

/** Ngày xa nhất cho phép chọn làm hạn hợp đồng (10 năm tới) */
function maxContractDate(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 10);
  return d;
}

/** Hôm nay theo giờ địa phương, đã bỏ phần giờ phút */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const transferBaseSchema = z.object({
  title: requiredText("tiêu đề", 150),
  address: requiredText("địa chỉ", 300),
  district: requiredText("khu vực (quận/huyện)", 100),
  city: requiredText("tỉnh/thành phố", 100),
  price: money("giá thuê").min(1, "Giá thuê phải lớn hơn 0"),
  deposit: money("số tiền đặt cọc"),
  deposit_months: z
    .number({ error: "Vui lòng chọn mức cọc" })
    .int()
    .refine((v): v is DepositMonths => (DEPOSIT_MONTHS as readonly number[]).includes(v), {
      message: "Chỉ nhận cọc 1 tháng hoặc cọc 3 tháng",
    }),
  contract_end_date: z
    .string({ error: "Vui lòng chọn ngày hết hạn hợp đồng" })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày hết hạn hợp đồng không hợp lệ")
    .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00`).getTime()), "Ngày hết hạn hợp đồng không hợp lệ")
    .refine((v) => new Date(`${v}T00:00:00`) >= today(), "Ngày hết hạn hợp đồng phải từ hôm nay trở đi")
    .refine((v) => new Date(`${v}T00:00:00`) <= maxContractDate(), "Ngày hết hạn hợp đồng quá xa"),
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
  images: z.array(listingImageSchema).max(12, "Tối đa 12 ảnh"),
});

/** Dữ liệu khách gửi lên khi tự đăng tin pass phòng */
export const transferPostSchema = transferBaseSchema;

/**
 * Dữ liệu admin sửa tin: có thêm hai trạng thái mà khách không được tự đặt.
 */
export const transferPostAdminSchema = transferBaseSchema.extend({
  is_published: z.boolean(),
  is_transferred: z.boolean(),
});

export type TransferFormInput = z.input<typeof transferPostSchema>;
export type TransferFormValues = z.output<typeof transferPostSchema>;
export type TransferAdminFormInput = z.input<typeof transferPostAdminSchema>;
export type TransferAdminFormValues = z.output<typeof transferPostAdminSchema>;

/** Số ảnh tối đa cho một tin pass phòng */
export const TRANSFER_IMAGE_MAX_COUNT = 12;

/** Thư mục riêng trong Storage cho ảnh khách tự tải lên */
export const TRANSFER_IMAGE_PREFIX = "pass";
