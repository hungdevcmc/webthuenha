import { CheckCircle2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ isAvailable, className }: { isAvailable: boolean; className?: string }) {
  return isAvailable ? (
    <Badge tone="available" className={className}>
      <CheckCircle2 className="size-3.5" aria-hidden="true" />
      Còn trống
    </Badge>
  ) : (
    <Badge tone="rented" className={className}>
      <Lock className="size-3.5" aria-hidden="true" />
      Đã cho thuê
    </Badge>
  );
}
