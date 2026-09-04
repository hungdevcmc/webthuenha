import { describe, expect, it } from "vitest";
import { randomSuffix, slugify, stripDiacritics } from "@/lib/slug";

describe("slugify", () => {
  it("bỏ dấu tiếng Việt", () => {
    expect(slugify("Phòng trọ 25 m² gần Lotte Mart Quận 7")).toBe("phong-tro-25-m-gan-lotte-mart-quan-7");
    expect(slugify("Nhà nguyên căn Đường Điện Biên Phủ")).toBe("nha-nguyen-can-duong-dien-bien-phu");
  });
  it("xử lý ký tự đặc biệt và khoảng trắng", () => {
    expect(slugify("  Căn hộ -- mini!!  ")).toBe("can-ho-mini");
    expect(slugify("")).toBe("");
  });
  it("giới hạn độ dài", () => {
    expect(slugify("a".repeat(200)).length).toBeLessThanOrEqual(80);
  });
});

describe("stripDiacritics", () => {
  it("giữ chữ hoa", () => {
    expect(stripDiacritics("Đà Nẵng")).toBe("Da Nang");
  });
});

describe("randomSuffix", () => {
  it("đúng độ dài và chỉ gồm chữ thường/số", () => {
    expect(randomSuffix(6)).toMatch(/^[a-z0-9]{6}$/);
  });
});
