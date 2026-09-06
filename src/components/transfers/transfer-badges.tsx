import { CalendarClock, CheckCircle2, Repeat2, UserRound, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { contractRemainingLabel, daysUntil, depositLabel, roomGenderLabel } from "@/lib/transfers/types";
import type { TransferPost } from "@/lib/transfers/types";

/** Nhãn trạng thái: đang cần pass hay đã pass xong */
export function TransferStatusBadge({ done, className }: { done: boolean; className?: string }) {
  const Icon = done ? CheckCircle2 : Repeat2;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        done ? "bg-stone-700 text-white" : "bg-amber-500 text-white",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {done ? "Đã pass xong" : "Đang cần pass"}
    </span>
  );
}

/** Nhãn số slot đang được nhượng lại */
export function SlotBadge({ count, className }: { count: number | null; className?: string }) {
  if (count === null || count < 1) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800 ring-1 ring-inset ring-violet-200",
        className,
      )}
    >
      <Users className="size-3.5" aria-hidden="true" />
      Pass {count} slot
    </span>
  );
}

/** Nhãn phòng dành cho nam, nữ hay cả hai */
export function RoomGenderBadge({
  gender,
  className,
}: {
  gender: TransferPost["room_gender"];
  className?: string;
}) {
  const tone =
    gender === "male"
      ? "bg-blue-50 text-blue-800 ring-blue-200"
      : gender === "female"
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
      <UserRound className="size-3.5" aria-hidden="true" />
      {roomGenderLabel(gender)}
    </span>
  );
}

/** Nhãn mức cọc: cọc 1 tháng hay cọc 3 tháng */
export function DepositBadge({ months, className }: { months: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-200",
        className,
      )}
    >
      <Wallet className="size-3.5" aria-hidden="true" />
      {depositLabel(months)}
    </span>
  );
}

/**
 * Nhãn hạn hợp đồng. Đổi màu khi sắp hết hạn để người xem chú ý.
 * `now` truyền từ ngoài vào để server và client hiển thị giống nhau.
 */
export function ContractBadge({
  date,
  now,
  withDate = true,
  className,
}: {
  date: string;
  now: number;
  withDate?: boolean;
  className?: string;
}) {
  const days = daysUntil(date, now);
  const tone =
    days < 0
      ? "bg-stone-100 text-stone-600 ring-stone-200"
      : days < 30
        ? "bg-red-50 text-red-700 ring-red-200"
        : days < 90
          ? "bg-amber-50 text-amber-800 ring-amber-200"
          : "bg-sky-50 text-sky-800 ring-sky-200";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tone,
        className,
      )}
    >
      <CalendarClock className="size-3.5" aria-hidden="true" />
      {withDate ? `Hết hạn ${formatDate(`${date}T00:00:00`)} · ` : ""}
      {contractRemainingLabel(date, now)}
    </span>
  );
}
