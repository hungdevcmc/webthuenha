import { Navigation } from "lucide-react";
import { siteConfig } from "@/config/site";
import { formatDistance } from "@/lib/format";
import { cn } from "@/lib/cn";

type Props = {
  km: number | null | undefined;
  /** true dùng tên đầy đủ của trường, false dùng tên ngắn cho gọn thẻ */
  full?: boolean;
  className?: string;
};

/** Nhãn khoảng cách từ phòng tới trường. Không hiện gì nếu chưa có số liệu. */
export function DistanceBadge({ km, full, className }: Props) {
  const text = formatDistance(km);
  if (!text) return null;
  const school = full ? siteConfig.school.name : siteConfig.school.shortName;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200",
        className,
      )}
    >
      <Navigation className="size-3.5 shrink-0" aria-hidden="true" />
      Cách {school} {text}
    </span>
  );
}
