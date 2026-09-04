import { cn } from "@/lib/cn";

type Tone = "available" | "rented" | "hidden" | "neutral" | "brand";

const toneClass: Record<Tone, string> = {
  available: "bg-brand-600 text-white",
  rented: "bg-stone-700 text-white",
  hidden: "bg-amber-100 text-amber-900 border border-amber-200",
  neutral: "bg-stone-100 text-stone-700",
  brand: "bg-brand-50 text-brand-800 border border-brand-200",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none", toneClass[tone], className)}>
      {children}
    </span>
  );
}
