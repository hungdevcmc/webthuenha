import { Users, UserRound } from "lucide-react";
import type { RoommateInfo } from "@/lib/listings/types";
import { cn } from "@/lib/cn";

type Props = { info: RoommateInfo; className?: string };

/** Nhãn cho biết phòng dành cho nam, cho nữ hay cả hai */
export function GenderBadge({ info, className }: Props) {
  const tone =
    info.gender === "male"
      ? "bg-blue-50 text-blue-800 ring-blue-200"
      : info.gender === "female"
        ? "bg-pink-50 text-pink-800 ring-pink-200"
        : "bg-stone-100 text-stone-700 ring-stone-200";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tone,
        className,
      )}
    >
      <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
      {info.genderText}
    </span>
  );
}

/** Nhãn ngắn hiển thị số người sẵn sàng ở ghép, dùng trên card và bảng quản trị */
export function RoommateBadge({ info, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800 ring-1 ring-inset ring-sky-200",
        className,
      )}
    >
      <Users className="size-3.5 shrink-0" aria-hidden="true" />
      <span>
        Ở ghép: {info.label}
        <span className="sr-only">
          {info.total > 0 ? ` – ${info.total} người sẵn sàng ở ghép` : " – chưa có ai đăng ký ở ghép"}
        </span>
      </span>
    </span>
  );
}
