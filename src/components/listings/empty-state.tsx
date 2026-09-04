import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <SearchX className="size-7" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {actionLabel && onAction ? (
        <Button variant="secondary" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
