import { describe, expect, it } from "vitest";
import { listingSchema } from "@/lib/listings/schema";
import {
  applyFilter,
  onlyRoommateListings,
  roommateInfo,
  sortListings,
  type ListingWithImages,
} from "@/lib/listings/types";

const valid = {
  title: "Phòng trọ 25 m²",
  address: "123 Trần Xuân Soạn, Quận 7",
  district: "Quận 7",
  city: "Thành phố Hồ Chí Minh",
  price: 3_500_000,
  deposit: 3_500_000,
  electricity_price: 3800,
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
  amenities: ["Máy lạnh"],
  description: "Phòng mới sơn sửa, có gác lửng, cửa sổ thoáng mát.",
  contact_name: "Anh Hưng",
  contact_phone: "0901 234 567",
  contact_zalo: "",
  is_available: true,
  is_published: true,
  roommate_open: false,
  roommate_male_count: 0,
  roommate_female_count: 0,
  roommate_note: "",
  images: [],
};

describe("listingSchema", () => {
  it("chấp nhận dữ liệu hợp lệ và chuẩn hóa", () => {
    const result = listingSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contact_phone).toBe("0901234567");
      expect(result.data.contact_zalo).toBeNull();
    }
  });

  it("từ chối giá thuê bằng 0 và số điện thoại sai", () => {
    expect(listingSchema.safeParse({ ...valid, price: 0 }).success).toBe(false);
    expect(listingSchema.safeParse({ ...valid, contact_phone: "12345" }).success).toBe(false);
  });

  it("từ chối thiếu tiêu đề và mô tả quá ngắn", () => {
    expect(listingSchema.safeParse({ ...valid, title: "" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...valid, description: "ngắn" }).success).toBe(false);
  });

  it("cho phép tầng để trống", () => {
    expect(listingSchema.safeParse({ ...valid, floor: null, total_floors: null }).success).toBe(true);
  });
});

function make(partial: Partial<ListingWithImages>): ListingWithImages {
  return {
    id: crypto.randomUUID(),
    slug: "x",
    title: "x",
    address: "x",
    district: "Quận 7",
    city: "HCM",
    price: 3_000_000,
    deposit: 0,
    electricity_price: 0,
    electricity_unit: "kWh",
    water_price: 0,
    water_unit: "m³",
    service_fee: 0,
    service_fee_included: false,
    area_m2: 20,
    bedrooms: 1,
    bathrooms: 1,
    floor: null,
    total_floors: null,
    amenities: [],
    description: "",
    contact_name: "x",
    contact_phone: "0901234567",
    contact_zalo: null,
    is_available: true,
    is_published: true,
    roommate_open: false,
    roommate_male_count: 0,
    roommate_female_count: 0,
    roommate_note: "",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    images: [],
    ...partial,
  };
}

describe("applyFilter / sortListings", () => {
  const items = [
    make({ price: 2_500_000, bedrooms: 1, district: "Quận 7", is_available: false, updated_at: "2026-02-01T00:00:00Z" }),
    make({ price: 6_000_000, bedrooms: 2, district: "Phú Nhuận" }),
    make({ price: 12_000_000, bedrooms: 3, district: "Gò Vấp" }),
  ];

  it("lọc theo giá, phòng ngủ, khu vực, trạng thái", () => {
    expect(applyFilter(items, { status: "all", price: "under3", bedrooms: "all", district: "all", gender: "all" })).toHaveLength(1);
    expect(applyFilter(items, { status: "all", price: "5to8", bedrooms: "all", district: "all", gender: "all" })).toHaveLength(1);
    expect(applyFilter(items, { status: "all", price: "all", bedrooms: "3plus", district: "all", gender: "all" })).toHaveLength(1);
    expect(applyFilter(items, { status: "all", price: "all", bedrooms: "all", district: "Phú Nhuận", gender: "all" })).toHaveLength(1);
    expect(applyFilter(items, { status: "available", price: "all", bedrooms: "all", district: "all", gender: "all" })).toHaveLength(2);
    expect(applyFilter(items, { status: "rented", price: "all", bedrooms: "all", district: "all", gender: "all" })).toHaveLength(1);
  });

  it("còn trống xếp trước dù cập nhật cũ hơn", () => {
    const sorted = sortListings(items);
    expect(sorted[sorted.length - 1].is_available).toBe(false);
  });
});

describe("tìm bạn ở ghép", () => {
  const roomA = make({ roommate_open: true, roommate_male_count: 2, roommate_female_count: 1 });
  const roomB = make({ roommate_open: true, roommate_male_count: 0, roommate_female_count: 3 });
  const roomC = make({ roommate_open: false, roommate_male_count: 0, roommate_female_count: 0 });
  const items = [roomA, roomB, roomC];

  it("chỉ giữ tin đang bật tìm bạn ở ghép", () => {
    expect(onlyRoommateListings(items)).toHaveLength(2);
  });

  it("trả về null khi tin không tìm bạn ở ghép", () => {
    expect(roommateInfo(roomC)).toBeNull();
  });

  it("tính tổng số người và ghi nhãn theo giới tính", () => {
    const info = roommateInfo(roomA);
    expect(info?.total).toBe(3);
    expect(info?.label).toBe("2 nam · 1 nữ");
    expect(roommateInfo(roomB)?.label).toBe("3 nữ");
  });

  it("lọc theo giới tính người ở ghép", () => {
    const base = { status: "all", price: "all", bedrooms: "all", district: "all" } as const;
    expect(applyFilter(items, { ...base, gender: "male" })).toHaveLength(1);
    expect(applyFilter(items, { ...base, gender: "female" })).toHaveLength(2);
    expect(applyFilter(items, { ...base, gender: "all" })).toHaveLength(3);
  });

  it("bắt buộc có ít nhất một người khi bật tìm bạn ở ghép", () => {
    const on = { ...valid, roommate_open: true, roommate_male_count: 0, roommate_female_count: 0 };
    expect(listingSchema.safeParse(on).success).toBe(false);
    expect(listingSchema.safeParse({ ...on, roommate_female_count: 1 }).success).toBe(true);
  });
});
