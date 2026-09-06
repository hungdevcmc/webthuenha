import { describe, expect, it } from "vitest";
import {
  applyTransferFilter,
  contractRemainingLabel,
  daysUntil,
  DEFAULT_TRANSFER_FILTER,
  depositLabel,
  kindBasePath,
  priceSuffix,
  roomGenderLabel,
  sortTransferPosts,
  type TransferFilter,
  type TransferWithImages,
} from "@/lib/transfers/types";
import { transferPostSchema } from "@/lib/transfers/schema";

const NOW = new Date("2026-09-06T00:00:00Z").getTime();

/** Ngày cách hôm nay `days` ngày, dạng YYYY-MM-DD */
function isoInDays(days: number): string {
  return new Date(NOW + days * 86_400_000).toISOString().slice(0, 10);
}

function makePost(over: Partial<TransferWithImages> = {}): TransferWithImages {
  return {
    id: over.id ?? "id-1",
    slug: "tin-pass",
    title: "Pass phòng 25 m²",
    address: "12 Trần Xuân Soạn",
    district: "Quận 7",
    city: "TP. Hồ Chí Minh",
    price: 4_000_000,
    deposit: 4_000_000,
    deposit_months: 1,
    contract_end_date: isoInDays(60),
    electricity_price: 3500,
    electricity_unit: "kWh",
    water_price: 20000,
    water_unit: "m³",
    service_fee: 0,
    service_fee_included: false,
    area_m2: 25,
    bedrooms: 1,
    bathrooms: 1,
    floor: null,
    total_floors: null,
    distance_to_school_km: null,
    kind: "room" as const,
    slot_count: null,
    room_gender: "any" as const,
    people_in_room: 0,
    amenities: [],
    description: "Phòng sạch, đầy đủ nội thất, cần pass lại vì chuyển công tác.",
    contact_name: "Chị Lan",
    contact_phone: "0901234567",
    contact_zalo: null,
    is_transferred: false,
    is_published: true,
    created_at: new Date(NOW).toISOString(),
    updated_at: new Date(NOW).toISOString(),
    images: [],
    ...over,
  };
}

describe("nhãn hạn hợp đồng", () => {
  it("tính đúng số ngày còn lại", () => {
    expect(daysUntil(isoInDays(10), NOW)).toBe(10);
    expect(daysUntil(isoInDays(0), NOW)).toBe(0);
    expect(daysUntil(isoInDays(-5), NOW)).toBe(-5);
  });

  it("hiển thị bằng tiếng Việt theo từng mốc", () => {
    expect(contractRemainingLabel(isoInDays(-1), NOW)).toBe("Đã hết hạn");
    expect(contractRemainingLabel(isoInDays(0), NOW)).toBe("Hết hạn hôm nay");
    expect(contractRemainingLabel(isoInDays(1), NOW)).toBe("Còn 1 ngày");
    expect(contractRemainingLabel(isoInDays(10), NOW)).toBe("Còn 10 ngày");
    expect(contractRemainingLabel(isoInDays(60), NOW)).toBe("Còn khoảng 2 tháng");
  });

  it("nhãn mức cọc đúng chữ", () => {
    expect(depositLabel(1)).toBe("Cọc 1 tháng");
    expect(depositLabel(3)).toBe("Cọc 3 tháng");
  });
});

describe("bộ lọc tin pass phòng", () => {
  const posts = [
    makePost({ id: "a", price: 2_500_000, deposit_months: 1, contract_end_date: isoInDays(15) }),
    makePost({ id: "b", price: 6_000_000, deposit_months: 3, contract_end_date: isoInDays(200) }),
    makePost({ id: "c", price: 9_000_000, deposit_months: 3, is_transferred: true, district: "Quận 1" }),
  ];

  const filter = (over: Partial<TransferFilter>): TransferFilter => ({
    ...DEFAULT_TRANSFER_FILTER,
    ...over,
  });

  it("mặc định chỉ hiện tin đang cần pass", () => {
    const result = applyTransferFilter(posts, DEFAULT_TRANSFER_FILTER, NOW);
    expect(result.map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("lọc theo mức cọc", () => {
    expect(applyTransferFilter(posts, filter({ deposit: "1" }), NOW).map((p) => p.id)).toEqual(["a"]);
    expect(applyTransferFilter(posts, filter({ deposit: "3" }), NOW).map((p) => p.id)).toEqual(["b"]);
  });

  it("lọc theo hạn hợp đồng còn lại", () => {
    expect(applyTransferFilter(posts, filter({ contract: "under1" }), NOW).map((p) => p.id)).toEqual(["a"]);
    expect(applyTransferFilter(posts, filter({ contract: "over3" }), NOW).map((p) => p.id)).toEqual(["b"]);
  });

  it("lọc theo khoảng giá và khu vực", () => {
    expect(applyTransferFilter(posts, filter({ price: "under3" }), NOW).map((p) => p.id)).toEqual(["a"]);
    expect(applyTransferFilter(posts, filter({ status: "all", district: "Quận 1" }), NOW).map((p) => p.id)).toEqual(["c"]);
  });

  it("xếp tin chưa pass lên trước", () => {
    const sorted = sortTransferPosts([posts[2], posts[0]]);
    expect(sorted[0].id).toBe("a");
  });
});

describe("kiểm tra dữ liệu form đăng tin", () => {
  const valid = {
    title: "Pass lại phòng 25 m²",
    address: "12 Trần Xuân Soạn, Phường Tân Hưng",
    district: "Quận 7",
    city: "TP. Hồ Chí Minh",
    price: 4_000_000,
    deposit: 4_000_000,
    deposit_months: 1,
    contract_end_date: isoInDays(90),
    electricity_price: 3500,
    electricity_unit: "kWh",
    water_price: 20000,
    water_unit: "m³",
    service_fee: 0,
    service_fee_included: false,
    area_m2: 25,
    bedrooms: 1,
    bathrooms: 1,
    floor: null,
    total_floors: null,
    amenities: ["Máy lạnh"],
    description: "Phòng sạch, đầy đủ nội thất, cần pass lại vì chuyển công tác.",
    contact_name: "Chị Lan",
    contact_phone: "0901234567",
    contact_zalo: null,
    images: [],
  };

  it("nhận dữ liệu hợp lệ", () => {
    expect(transferPostSchema.safeParse(valid).success).toBe(true);
  });

  it("không gửi khoảng cách tới trường thì hiểu là chưa đo", () => {
    const parsed = transferPostSchema.parse(valid);
    expect(parsed.distance_to_school_km).toBeNull();
  });

  it("từ chối khoảng cách âm hoặc quá xa", () => {
    expect(transferPostSchema.safeParse({ ...valid, distance_to_school_km: -1 }).success).toBe(false);
    expect(transferPostSchema.safeParse({ ...valid, distance_to_school_km: 900 }).success).toBe(false);
    expect(transferPostSchema.safeParse({ ...valid, distance_to_school_km: 1.5 }).success).toBe(true);
  });

  it("bắt buộc chọn cọc 1 hoặc cọc 3 tháng", () => {
    const result = transferPostSchema.safeParse({ ...valid, deposit_months: 2 });
    expect(result.success).toBe(false);
  });

  it("từ chối ngày hết hạn hợp đồng đã qua", () => {
    const result = transferPostSchema.safeParse({ ...valid, contract_end_date: "2020-01-01" });
    expect(result.success).toBe(false);
  });

  it("từ chối ngày hết hạn sai định dạng", () => {
    expect(transferPostSchema.safeParse({ ...valid, contract_end_date: "06/09/2026" }).success).toBe(false);
  });

  it("bỏ qua trạng thái mà khách tự gửi lên", () => {
    const parsed = transferPostSchema.parse({ ...valid, is_published: false, is_transferred: true });
    expect("is_published" in parsed).toBe(false);
    expect("is_transferred" in parsed).toBe(false);
  });
});

describe("pass slot phòng", () => {
  const slotBase = {
    ...{
      title: "Pass lại 1 slot phòng nữ",
      address: "Tòa S2.03, Vinhomes Ocean Park",
      district: "Quận Gia Lâm",
      city: "Thành phố Hà Nội",
      price: 2_800_000,
      deposit: 2_800_000,
      deposit_months: 1,
      contract_end_date: isoInDays(120),
      electricity_price: 3500,
      electricity_unit: "kWh",
      water_price: 20000,
      water_unit: "m³",
      service_fee: 0,
      service_fee_included: false,
      area_m2: 86,
      bedrooms: 2,
      bathrooms: 2,
      floor: null,
      total_floors: null,
      amenities: [],
      description: "Mình đi thực tập xa nên cần pass lại một slot trong phòng nữ ba bạn.",
      contact_name: "Bạn Mai",
      contact_phone: "0977123456",
      contact_zalo: null,
      images: [],
    },
    kind: "slot" as const,
    slot_count: 1,
    room_gender: "female" as const,
    people_in_room: 2,
  };

  it("nhận tin pass slot hợp lệ", () => {
    expect(transferPostSchema.safeParse(slotBase).success).toBe(true);
  });

  it("tin pass slot bắt buộc có số slot", () => {
    expect(transferPostSchema.safeParse({ ...slotBase, slot_count: null }).success).toBe(false);
    expect(transferPostSchema.safeParse({ ...slotBase, slot_count: 0 }).success).toBe(false);
    expect(transferPostSchema.safeParse({ ...slotBase, slot_count: 11 }).success).toBe(false);
  });

  it("tin pass cả phòng không cần số slot", () => {
    const room = { ...slotBase, kind: "room" as const, slot_count: null };
    expect(transferPostSchema.safeParse(room).success).toBe(true);
  });

  it("mặc định là tin pass cả phòng khi không gửi loại", () => {
    const withoutKind: Record<string, unknown> = { ...slotBase };
    delete withoutKind.kind;
    delete withoutKind.slot_count;
    const parsed = transferPostSchema.parse(withoutKind);
    expect(parsed.kind).toBe("room");
    expect(parsed.slot_count).toBeNull();
  });

  it("đơn vị giá và đường dẫn khác nhau theo loại tin", () => {
    expect(priceSuffix("slot")).toBe("/slot/tháng");
    expect(priceSuffix("room")).toBe("/tháng");
    expect(kindBasePath("slot")).toBe("/pass-slot");
    expect(kindBasePath("room")).toBe("/pass-phong");
  });

  it("nhãn phòng dành cho ai", () => {
    expect(roomGenderLabel("male")).toBe("Phòng nam");
    expect(roomGenderLabel("female")).toBe("Phòng nữ");
    expect(roomGenderLabel("any")).toBe("Nam hoặc nữ");
  });
});
