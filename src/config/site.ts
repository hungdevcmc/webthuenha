/**
 * CẤU HÌNH THƯƠNG HIỆU VÀ LIÊN HỆ MẶC ĐỊNH
 * --------------------------------------
 * Đây là nơi duy nhất chứa tên thương hiệu, số điện thoại, Zalo, địa chỉ...
 * Đổi thông tin tại đây là toàn bộ website thay đổi theo.
 */
export const siteConfig = {
  /** Tên thương hiệu hiển thị trên toàn website */
  name: "Nhà Trọ An Tâm",
  /** Khẩu hiệu ngắn, hiển thị ở đầu trang chủ */
  tagline: "Phòng sạch, giá rõ ràng, chủ nhà uy tín",
  /** Lời giới thiệu ngắn ở đầu trang chủ */
  intro:
    "Chúng tôi trực tiếp quản lý các phòng và căn hộ dưới đây. Không qua môi giới, giá niêm yết đúng như thực tế, xem phòng miễn phí bất cứ lúc nào.",
  /** Mô tả dùng cho SEO / chia sẻ mạng xã hội */
  description:
    "Cho thuê phòng trọ, căn hộ mini và nhà nguyên căn. Giá minh bạch, không môi giới, liên hệ trực tiếp chủ nhà.",
  /** Thông tin liên hệ mặc định (dùng khi tin đăng không ghi riêng) */
  contact: {
    name: "Anh Hưng (chủ nhà)",
    /** Số điện thoại dạng hiển thị */
    phone: "0901 234 567",
    /** Số dùng cho liên kết gọi điện và Zalo (chỉ chữ số) */
    phoneRaw: "0901234567",
    /** Địa chỉ văn phòng / khu vực hoạt động */
    address: "Quận 7, Thành phố Hồ Chí Minh",
    /** Khung giờ nhận cuộc gọi */
    hours: "8:00 – 21:00 hằng ngày",
  },
  /** Thành phố mặc định khi tạo tin mới trong trang quản trị */
  defaultCity: "Thành phố Hồ Chí Minh",
  /** Địa chỉ website production (dùng cho SEO). Có thể ghi đè bằng biến NEXT_PUBLIC_SITE_URL */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Các tiện nghi gợi ý trong form quản trị */
  amenitySuggestions: [
    "Máy lạnh",
    "Máy nước nóng",
    "Tủ lạnh",
    "Máy giặt",
    "Giường",
    "Nệm",
    "Tủ quần áo",
    "Bàn làm việc",
    "Bếp riêng",
    "Kệ bếp",
    "Ban công",
    "Cửa sổ thoáng",
    "Wifi",
    "Thang máy",
    "Chỗ để xe",
    "Camera an ninh",
    "Bảo vệ 24/7",
    "Giờ giấc tự do",
    "Nuôi thú cưng",
  ],
} as const;

/** Tạo link Zalo từ số điện thoại hoặc link đầy đủ */
export function zaloLink(zalo: string | null | undefined): string | null {
  if (!zalo) return null;
  const value = zalo.trim();
  if (/^https?:\/\//i.test(value)) return value;
  const digits = value.replace(/\D/g, "");
  return digits ? `https://zalo.me/${digits}` : null;
}

/** Tạo link gọi điện tel: từ số hiển thị */
export function telLink(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}
