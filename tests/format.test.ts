import { describe, expect, it } from "vitest";
import { formatArea, formatPhone, formatRelative, formatUnitPrice, formatVND, formatVNDShort } from "@/lib/format";

describe("formatVND", () => {
  it("định dạng tiền Việt", () => {
    expect(formatVND(3_500_000).replace(/ /g, " ")).toBe("3.500.000 ₫");
    expect(formatVND(0).replace(/ /g, " ")).toBe("0 ₫");
    expect(formatVND(null)).toBe("—");
  });
  it("dạng ngắn", () => {
    expect(formatVNDShort(3_500_000)).toBe("3,5 triệu");
    expect(formatVNDShort(12_000_000)).toBe("12 triệu");
    expect(formatVNDShort(900_000)).toBe("900 nghìn");
  });
});

describe("formatUnitPrice", () => {
  it("giá 0 là miễn phí", () => {
    expect(formatUnitPrice(0, "kWh")).toBe("Miễn phí");
    expect(formatUnitPrice(3800, "kWh").replace(/ /g, " ")).toBe("3.800 ₫/kWh");
  });
});

describe("formatArea / formatPhone / formatRelative", () => {
  it("diện tích", () => {
    expect(formatArea(25)).toBe("25 m²");
    expect(formatArea(25.5)).toBe("25,5 m²");
  });
  it("điện thoại", () => {
    expect(formatPhone("0901234567")).toBe("0901 234 567");
  });
  it("thời gian tương đối", () => {
    const now = new Date("2026-09-05T10:00:00Z").getTime();
    expect(formatRelative("2026-09-05T09:59:40Z", now)).toBe("vừa xong");
    expect(formatRelative("2026-09-05T09:30:00Z", now)).toBe("30 phút trước");
    expect(formatRelative("2026-09-04T10:00:00Z", now)).toBe("1 ngày trước");
  });
});
