"use client";

import { SafeImage } from "@/components/listings/safe-image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ImageOff, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteListing, setListingAvailability, setListingPublished } from "@/lib/listings/actions";
import { coverImage, roommateInfo, type ListingWithImages } from "@/lib/listings/types";
import { formatRelative, formatVND } from "@/lib/format";
import { stripDiacritics } from "@/lib/slug";
import { useListingsRealtime } from "@/hooks/use-listings-realtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-fields";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/listings/status-badge";
import { RoommateBadge } from "@/components/listings/roommate-badge";
import { EmptyState } from "@/components/listings/empty-state";
import { cn } from "@/lib/cn";

type Quick = "all" | "available" | "rented" | "published" | "hidden";

const quickFilters: { value: Quick; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "available", label: "Còn trống" },
  { value: "rented", label: "Đã cho thuê" },
  { value: "published", label: "Đang hiển thị" },
  { value: "hidden", label: "Đã ẩn" },
];

function normalizeText(s: string) {
  return stripDiacritics(s).toLowerCase();
}

export function AdminListingTable({ listings }: { listings: ListingWithImages[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState<Quick>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ListingWithImages | null>(null);
  const [isPending, startTransition] = useTransition();
  const [now] = useState(() => Date.now());

  useListingsRealtime({ onChange: () => router.refresh() });

  const visible = useMemo(() => {
    const q = normalizeText(query.trim());
    return listings.filter((l) => {
      if (quick === "available" && !l.is_available) return false;
      if (quick === "rented" && l.is_available) return false;
      if (quick === "published" && !l.is_published) return false;
      if (quick === "hidden" && l.is_published) return false;
      if (!q) return true;
      return normalizeText(`${l.title} ${l.address} ${l.district} ${l.slug}`).includes(q);
    });
  }, [listings, query, quick]);

  function run(id: string, action: () => Promise<{ ok: boolean; error?: string }>, successMessage: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(successMessage);
        router.refresh();
      } else {
        toast.error(result.error ?? "Thao tác thất bại");
      }
      setPendingId(null);
    });
  }

  const counts = {
    all: listings.length,
    available: listings.filter((l) => l.is_available).length,
    rented: listings.filter((l) => !l.is_available).length,
    published: listings.filter((l) => l.is_published).length,
    hidden: listings.filter((l) => !l.is_published).length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, địa chỉ, khu vực…"
            aria-label="Tìm kiếm tin"
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
                quick === f.value ? "border-brand-600 bg-brand-600 text-white" : "border-stone-300 bg-white text-ink hover:bg-stone-50",
              )}
            >
              {f.label} <span className="opacity-70">({counts[f.value]})</span>
            </button>
          ))}
        </div>
      </div>

      {listings.length === 0 ? (
        <EmptyState title="Chưa có tin nào" description="Bấm “Đăng tin mới” để tạo tin đầu tiên." />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Không tìm thấy tin phù hợp"
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
            const busy = isPending && pendingId === l.id;
            return (
              <li
                key={l.id}
                className={cn(
                  "grid gap-3 rounded-2xl border bg-white p-3 shadow-card sm:grid-cols-[96px_1fr] sm:p-4",
                  l.is_published ? "border-stone-200" : "border-dashed border-amber-300 bg-amber-50/40",
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
                    <StatusBadge isAvailable={l.is_available} />
                    {l.is_published ? <Badge tone="brand">Đang hiển thị</Badge> : <Badge tone="hidden">Đã ẩn</Badge>}
                    {roommateInfo(l) ? <RoommateBadge info={roommateInfo(l)!} /> : null}
                    <span className="text-xs text-stone-400">Cập nhật {formatRelative(l.updated_at, now)}</span>
                  </div>
                  <h2 className="mt-1.5 truncate text-base font-semibold text-ink">
                    <Link href={`/admin/phong/${l.id}/chinh-sua`} className="hover:text-brand-700">
                      {l.title}
                    </Link>
                  </h2>
                  <p className="truncate text-sm text-muted">{l.address}</p>
                  <p className="mt-1 text-sm font-semibold text-accent-600">
                    {formatVND(l.price)}
                    <span className="font-normal text-muted">/tháng</span>
                    <span className="ml-3 font-normal text-muted">
                      {l.bedrooms} PN · {l.images.length} ảnh
                    </span>
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/phong/${l.id}/chinh-sua`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold hover:bg-stone-50"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Sửa
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        run(
                          l.id,
                          () => setListingAvailability(l.id, !l.is_available),
                          l.is_available ? "Đã chuyển sang “Đã cho thuê”" : "Đã chuyển sang “Còn trống”",
                        )
                      }
                    >
                      {l.is_available ? "Đánh dấu đã cho thuê" : "Đánh dấu còn trống"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        run(l.id, () => setListingPublished(l.id, !l.is_published), l.is_published ? "Đã ẩn tin" : "Đã công khai tin")
                      }
                    >
                      {l.is_published ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                      {l.is_published ? "Ẩn tin" : "Công khai"}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" disabled={busy} onClick={() => setToDelete(l)}>
                      <Trash2 className="size-4" aria-hidden="true" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Xóa tin này?"
        description={
          toDelete
            ? `“${toDelete.title}” cùng ${toDelete.images.length} ảnh sẽ bị xóa vĩnh viễn. Không thể hoàn tác.`
            : ""
        }
        confirmLabel="Xóa vĩnh viễn"
        danger
        busy={isPending && pendingId === toDelete?.id}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          const target = toDelete;
          run(target.id, () => deleteListing(target.id), "Đã xóa tin");
          setToDelete(null);
        }}
      />
    </div>
  );
}
