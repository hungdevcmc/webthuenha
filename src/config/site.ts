/**
 * CẤU HÌNH THƯƠNG HIỆU VÀ LIÊN HỆ MẶC ĐỊNH
 * --------------------------------------
 * Đây là nơi duy nhất chứa tên thương hiệu, số điện thoại, Zalo, địa chỉ...
 * Đổi thông tin tại đây là toàn bộ website thay đổi theo.
 */
/** Địa chỉ mặc định của website khi không có biến môi trường hợp lệ */
const FALLBACK_SITE_URL = "https://aithucchiennhatro.vercel.app";

/**
 * Lấy địa chỉ website. Nhận biến NEXT_PUBLIC_SITE_URL nếu là URL hợp lệ,
 * ngược lại dùng giá trị mặc định. Tránh việc biến rỗng làm hỏng build.
 */
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;
  try {
    return new URL(raw).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const siteConfig = {
  /** Tên thương hiệu hiển thị trên toàn website */
  name: "Nhà trọ VinUni AI Thực Chiến",
  /** Khẩu hiệu ngắn, hiển thị ở đầu trang chủ */
  tagline: "Phòng sạch, giá rõ ràng, chủ nhà uy tín",
  /** Lời giới thiệu ngắn ở đầu trang chủ */
  intro:
    "Chúng tôi trực tiếp quản lý các phòng và căn hộ dưới đây. Không qua môi giới, giá niêm yết đúng như thực tế, xem phòng miễn phí bất cứ lúc nào.",
  /** Mô tả dùng cho SEO / chia sẻ mạng xã hội */
  description:
    "Cho thuê phòng trọ, căn hộ mini và nhà nguyên căn. Giá minh bạch, không môi giới, liên hệ trực tiếp chủ nhà.",
  /** Nội dung tab "Tìm bạn ở ghép" */
  roommate: {
    title: "Tìm bạn ở ghép",
    intro:
      "Những phòng dưới đây đang cần thêm người ở ghép để chia tiền thuê. Mỗi tin ghi rõ giá một chỗ mỗi tháng, phòng dành cho nam hay nữ và hiện đã có mấy bạn ở cùng.",
    /** Chữ trên nút đăng ký ở ghép (bấm vào mở Zalo của chủ nhà) */
    signUpLabel: "Đăng ký ở ghép",
  },
  /** Nội dung tab "Pass slot phòng" (tin do khách tự đăng) */
  slotTransfer: {
    title: "Pass slot phòng",
    intro:
      "Nơi các bạn đang ở ghép nhượng lại chỗ của mình trong phòng. Mỗi tin ghi rõ pass mấy slot, giá một slot mỗi tháng, phòng dành cho nam hay nữ và hợp đồng còn hạn tới ngày nào.",
  },
  /**
   * MINH BẠCH VÀ CAM KẾT
   * --------------------
   * Nội dung theo yêu cầu của Ban tổ chức chương trình. Sửa ở đây là
   * đổi cả banner trang chủ, trang /cam-ket và chân trang.
   */
  compliance: {
    /** Dòng miễn trừ trách nhiệm, hiện ở trang chủ và chân mọi trang */
    disclaimer:
      "Đây là dự án cá nhân nhằm hỗ trợ cộng đồng học viên, hoàn toàn không trực thuộc, không đại diện và không được bảo lãnh bởi Ban tổ chức chương trình.",

    /**
     * TÀI CHÍNH
     * true  = phi lợi nhuận 100%, không nhận hoa hồng từ chủ nhà.
     * false = có nhận hoa hồng; nội dung trong `commissionNote` sẽ hiện
     *         ở chân trang và trang /cam-ket.
     */
    nonProfit: false,
    /** Chỉ dùng khi nonProfit = false. Muốn ghi rõ mức hoa hồng thì bổ sung vào câu này. */
    commissionNote:
      "Chi phí vận hành dự án hoàn toàn do chủ nhà chi trả. Học viên không phải thanh toán bất kỳ khoản nào.",

    /** Thời điểm đóng và xóa dữ liệu do học viên gửi lên */
    dataRetention: "khi đợt tìm phòng của khóa học kết thúc",

    /** Mô tả ngắn về việc dùng dữ liệu, hiện ở form đăng tin */
    privacyShort:
      "Thông tin bạn nhập chỉ dùng để người có nhu cầu liên hệ thuê hoặc ghép phòng, không chia sẻ cho bên thứ ba nào khác.",
  },
  /** Trường học dùng làm mốc đo khoảng cách của mỗi phòng */
  school: {
    /** Tên đầy đủ, hiện trong nhãn và form */
    name: "Đại học VinUni",
    /** Tên ngắn, hiện trên thẻ phòng cho gọn */
    shortName: "VinUni",
  },
  /** Nội dung tab "Pass lại phòng" (tin do khách tự đăng) */
  transfer: {
    title: "Pass lại phòng",
    intro:
      "Nơi người đang thuê đăng tin nhượng lại phòng của mình. Mỗi tin ghi rõ hợp đồng còn hạn tới ngày nào và người nhận phải đóng cọc mấy tháng.",
  },
  /** Thông tin liên hệ mặc định (dùng khi tin đăng không ghi riêng) */
  contact: {
    name: "Anh Hưng (chủ nhà)",
    /** Số điện thoại dạng hiển thị */
    phone: "0372 464 016",
    /** Số dùng cho liên kết gọi điện và Zalo (chỉ chữ số) */
    phoneRaw: "0372464016",
    /** Địa chỉ văn phòng / khu vực hoạt động */
    address: "Vinhomes Ocean Park 1, Hà Nội",
    /** Khung giờ nhận cuộc gọi */
    hours: "8:00 – 21:00 hằng ngày",
  },
  /** Thành phố mặc định khi tạo tin mới trong trang quản trị */
  defaultCity: "Thành phố Hà Nội",
  /** Địa chỉ website production (dùng cho SEO). Có thể ghi đè bằng biến NEXT_PUBLIC_SITE_URL */
  url: resolveSiteUrl(),
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
