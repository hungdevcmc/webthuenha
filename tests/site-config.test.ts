import { describe, expect, it } from "vitest";

/** resolveSiteUrl không được để biến môi trường rỗng/sai làm hỏng build */
function resolveSiteUrl(raw: string | undefined, fallback = "https://aithucchiennhatro.vercel.app") {
  const value = raw?.trim();
  if (!value) return fallback;
  try {
    return new URL(value).origin;
  } catch {
    return fallback;
  }
}

describe("resolveSiteUrl", () => {
  it("dùng giá trị mặc định khi biến rỗng hoặc thiếu", () => {
    expect(resolveSiteUrl(undefined)).toBe("https://aithucchiennhatro.vercel.app");
    expect(resolveSiteUrl("")).toBe("https://aithucchiennhatro.vercel.app");
    expect(resolveSiteUrl("   ")).toBe("https://aithucchiennhatro.vercel.app");
  });
  it("dùng giá trị mặc định khi biến không phải URL", () => {
    expect(resolveSiteUrl("khong-phai-url")).toBe("https://aithucchiennhatro.vercel.app");
  });
  it("nhận URL hợp lệ và bỏ phần thừa", () => {
    expect(resolveSiteUrl("https://vidu.vercel.app")).toBe("https://vidu.vercel.app");
    expect(resolveSiteUrl(" https://vidu.vercel.app/trang?a=1 ")).toBe("https://vidu.vercel.app");
  });
});
