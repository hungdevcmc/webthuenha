import { MessageCircle } from "lucide-react";
import { siteConfig, zaloLink } from "@/config/site";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = {
  /** Tiêu đề phòng, đưa vào nhãn trợ năng để người dùng trình đọc màn hình biết đăng ký phòng nào */
  listingTitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Nút "Đăng ký ở ghép": mở thẳng Zalo của chủ nhà (số trong src/config/site.ts).
 * Dùng ở cả thẻ phòng ngoài danh sách lẫn trang chi tiết.
 */
export function RoommateSignUpButton({ listingTitle, size = "sm", className }: Props) {
  const href = zaloLink(siteConfig.contact.phoneRaw);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // z-10 để nút nổi lên trên lớp phủ liên kết của thẻ phòng
      className={cn(buttonClasses("primary", size), "relative z-10", className)}
      aria-label={
        listingTitle
          ? `${siteConfig.roommate.signUpLabel} cho ${listingTitle} qua Zalo (mở tab mới)`
          : `${siteConfig.roommate.signUpLabel} qua Zalo (mở tab mới)`
      }
    >
      <MessageCircle className={size === "lg" ? "size-5" : "size-4"} aria-hidden="true" />
      {siteConfig.roommate.signUpLabel}
    </a>
  );
}
