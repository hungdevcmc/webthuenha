import { MessageCircle, Phone } from "lucide-react";
import { telLink, zaloLink } from "@/config/site";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = {
  phone: string;
  zalo?: string | null;
  /** Khi tin đã cho thuê: vô hiệu hóa lời kêu gọi */
  disabled?: boolean;
  disabledText?: string;
};

/** Nút gọi điện và Zalo. Dùng ở trang chi tiết và thanh cố định trên điện thoại. */
export function ContactButtons({ phone, zalo, disabled, disabledText, className }: Props & { className?: string }) {
  const tel = telLink(phone);
  const zl = zaloLink(zalo);

  if (disabled) {
    return (
      <div className={cn("rounded-xl bg-stone-100 px-4 py-3 text-center text-sm font-medium text-stone-600", className)} role="status">
        {disabledText ?? "Phòng này đã có người thuê."}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3", className)}>
      {tel ? (
        <a href={tel} className={buttonClasses("accent", "lg", "flex-1")} aria-label={`Gọi điện ${phone}`}>
          <Phone className="size-5" aria-hidden="true" />
          Gọi ngay
        </a>
      ) : null}
      {zl ? (
        <a
          href={zl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("primary", "lg", "flex-1")}
          aria-label="Nhắn tin qua Zalo (mở tab mới)"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          Nhắn Zalo
        </a>
      ) : null}
    </div>
  );
}

/** Thanh liên hệ cố định phía dưới màn hình điện thoại */
export function MobileContactBar(props: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
      <ContactButtons {...props} />
    </div>
  );
}
