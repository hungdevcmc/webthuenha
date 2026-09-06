"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, Pencil, Power, Search } from "lucide-react";
import { toast } from "sonner";
import { SafeImage } from "@/components/listings/safe-image";
import { updateRoommateInfo } from "@/lib/listings/actions";
import { coverImage, roommateInfo, type ListingWithImages } from "@/lib/listings/types";
import { formatDistance, formatVND } from "@/lib/format";
import { stripDiacritics } from "@/lib/slug";
import { useListingsRealtime } from "@/hooks/use-listings-realtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-fields";
import { EmptyState } from "@/components/listings/empty-state";
import { GenderBadge, RoommateBadge } from "@/components/listings/roommate-badge";
import { DistanceBadge } from "@/components/listings/distance-badge";
import { cn } from "@/lib/cn";

type Quick = "all" | "open" | "off" | "missing";

const quickFilters: { value: Quick; label: string }[] = [
  { value: "all", label: "Tất cả phòng" },
  { value: "open", label: "Đang tìm ghép" },
  { value: "off", label: "Chưa bật" },
  { value: "missing", label: "Thiếu giá chỗ" },
];

function normalizeText(s: string) {
  return stripDiacritics(s).toLowerCase();
}

export function AdminRoommateTable({ listings }: { listings: ListingWithImages[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState<Quick>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useListingsRealtime({ onChange: () => router.refresh() });

  const visible = useMemo(() => {
    const q = normalizeText(query.trim());
    return listings.filter((l) => {
      if (quick === "open" && !l.roommate_open) return false;
      if (quick === "off" && l.roommate_open) return false;
      if (quick === "missing" && !(l.roommate_open && l.roommate_slot_price <= 0)) return false;
      if (!q) return true;
      return normalizeText(`${l.title} ${l.address} ${l.district} ${l.slug}`).includes(q);
    });
  }, [listings, query, quick]);

  const counts = {
    all: listings.length,
    open: listings.filter((l) => l.roommate_open).length,
    off: listings.filter((l) => !l.roommate_open).length,
    missing: listings.filter((l) => l.roommate_open && l.roommate_slot_price <= 0).length,
  };

  /** Bật/tắt nhanh chế độ ở ghép, giữ nguyên các thông tin còn lại */
  function toggleOpen(l: ListingWithImages) {
    const next = !l.roommate_open;
    // Bật lên mà chưa có giá một chỗ thì mở form để nhập trước
    if (next && l.roommate_slot_price <= 0) {
      toast.info("Cần nhập giá một chỗ trước khi bật.");
      router.push(`/admin/o-ghep/${l.id}/chinh-sua`);
      return;
    }
    setPendingId(l.id);
    startTransition(async () => {
      const result = await updateRoommateInfo(l.id, {
        roommate_open: next,
        roommate_slot_price: l.roommate_slot_price,
        roommate_gender: l.roommate_gender,
        roommate_male_count: l.roommate_male_count,
        roommate_female_count: l.roommate_female_count,
        roommate_note: l.roommate_note,
        distance_to_school_km: l.distance_to_school_km === null ? null : Number(l.distance_to_school_km),
      });
      if (result.ok) {
        toast.success(next ? "Đã bật tìm bạn ở ghép" : "Đã tắt tìm bạn ở ghép");
        router.refresh();
      } else {
        toast.error(result.error);
      }
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, địa chỉ, khu vực…"
            aria-label="Tìm kiếm phòng"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc nhanh">
          {quickFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setQuick(f.value)}
              aria-pressed={quick === f.value}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                quick === f.value
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-stone-300 bg-white text-ink hover:bg-stone-50",
              )}
            >
              {f.label} <span className="opacity-70">({counts[f.value]})</span>
            </button>
          ))}
        </div>
      </div>

      {listings.length === 0 ? (
        <EmptyState title="Chưa có phòng nào" description="Tạo tin đăng trước rồi quay lại đây bật chế độ ở ghép." />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Không tìm thấy phòng phù hợp"
          description="Thử từ khóa khác hoặc bỏ bộ lọc."
          actionLabel="Bỏ lọc"
          onAction={() => {
            setQuery("");
            setQuick("all");
          }}
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((l) => {
            const cover = coverImage(l);
            const info = roommateInfo(l);
            const busy = isPending && pendingId === l.id;
            const missingPrice = l.roommate_open && l.roommate_slot_price <= 0;
            return (
              <li
                key={l.id}
                className={cn(
                  "grid gap-3 rounded-2xl border bg-white p-3 shadow-card sm:grid-cols-[96px_1fr] sm:p-4",
                  l.roommate_open ? "border-sky-200" : "border-stone-200 bg-stone-50/60",
                )}
                aria-busy={busy}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 sm:aspect-square">
                  {cover ? (
                    <SafeImage src={cover.url} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-400">
                      <ImageOff className="size-6" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {l.roommate_open ? <Badge tone="brand">Đang tìm ghép</Badge> : <Badge tone="hidden">Chưa bật</Badge>}
                    {info ? <GenderBadge info={info} /> : null}
                    {info ? <RoommateBadge info={info} /> : null}
                    <DistanceBadge km={l.distance_to_school_km} />
                  </div>
                  <h2 className="mt-1.5 truncate text-base font-semibold text-ink">
                    <Link href={`/admin/o-ghep/${l.id}/chinh-sua`} className="hover:text-brand-700">
                      {l.title}
                    </Link>
                  </h2>
                  <p className="truncate text-sm text-muted">{l.address}</p>

                  <dl className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    <div className="flex gap-1.5">
                      <dt className="text-muted">Giá một chỗ:</dt>
                      <dd className={cn("font-semibold", missingPrice ? "text-red-600" : "text-accent-600")}>
                        {l.roommate_slot_price > 0 ? `${formatVND(l.roommate_slot_price)}/tháng` : "chưa đặt"}
                      </dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-muted">Giá cả phòng:</dt>
                      <dd className="font-medium text-ink">{formatVND(l.price)}/tháng</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-muted">Cách trường:</dt>
                      <dd className="font-medium text-ink">{formatDistance(l.distance_to_school_km) ?? "chưa đo"}</dd>
                    </div>
                  </dl>

                  {missingPrice ? (
                    <p className="mt-1.5 text-sm text-red-600">
                      Tin đang hiện ở tab ở ghép nhưng chưa có giá một chỗ, khách sẽ thấy giá cả phòng.
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/o-ghep/${l.id}/chinh-sua`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold hover:bg-stone-50"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Sửa thông tin ở ghép
                    </Link>
                    <Button variant="secondary" size="sm" disabled={busy} onClick={() => toggleOpen(l)}>
                      <Power className="size-4" aria-hidden="true" />
                      {l.roommate_open ? "Tắt tìm ghép" : "Bật tìm ghép"}
                    </Button>
                    <Link
                      href={`/admin/phong/${l.id}/chinh-sua`}
                      className="inline-flex h-9 items-center rounded-xl px-3 text-sm font-semibold text-muted hover:text-ink"
                    >
                      Sửa toàn bộ tin
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
