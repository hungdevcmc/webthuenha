import Link from "next/link";
import { Flag } from "lucide-react";
import { siteConfig, zaloLink } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Kênh báo cáo tin vi phạm (ép giá, tranh chấp cọc, thông tin sai sự thật).
 * Bấm vào mở Zalo của người vận hành kèm sẵn nội dung tin bị báo cáo.
 */
export function ReportLink({ subject, className }: { subject: string; className?: string }) {
  const zalo = zaloLink(siteConfig.contact.phoneRaw);

  return (
    <p className={cn("text-xs leading-relaxed text-muted", className)}>
      <Flag className="mr-1 inline size-3.5 align-[-2px] text-stone-400" aria-hidden="true" />
      Thấy tin sai sự thật, bị ép giá hay tranh chấp cọc?{" "}
      {zalo ? (
        <a
          href={zalo}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-700 underline hover:text-brand-800"
          aria-label={`Báo cáo tin "${subject}" qua Zalo (mở tab mới)`}
        >
          Báo cho người vận hành
        </a>
      ) : (
        <span className="font-semibold text-ink">Gọi {siteConfig.contact.phone}</span>
      )}{" "}
      hoặc gọi {siteConfig.contact.phone}. Tin vi phạm được gỡ trong 24 giờ.{" "}
      <Link href="/cam-ket" className="underline hover:text-ink">
        Cam kết minh bạch
      </Link>
    </p>
  );
}
