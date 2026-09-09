import Link from "next/link";
import { Info } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Dòng miễn trừ trách nhiệm theo yêu cầu của Ban tổ chức chương trình.
 * Nội dung nằm trong siteConfig.compliance.disclaimer.
 */
export function DisclaimerNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950",
        className,
      )}
    >
      <Info className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true" />
      <p>
        <span className="font-semibold">Lưu ý: </span>
        {siteConfig.compliance.disclaimer}{" "}
        <Link href="/cam-ket" className="font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950">
          Xem cam kết minh bạch
        </Link>
      </p>
    </div>
  );
}
