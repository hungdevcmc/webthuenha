"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ImageOff, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SafeImage } from "@/components/listings/safe-image";
import { deleteTransferPost, setTransferDone, setTransferPublished } from "@/lib/transfers/actions";
import { transferCover, type TransferWithImages } from "@/lib/transfers/types";
import { formatDate, formatRelative, formatVND } from "@/lib/format";
import { stripDiacritics } from "@/lib/slug";
import { useTransfersRealtime } from "@/hooks/use-transfers-realtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-fields";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/listings/empty-state";
import { ContractBadge, DepositBadge, TransferStatusBadge } from "@/components/transfers/transfer-badges";
import { cn } from "@/lib/cn";

type Quick = "all" | "open" | "done" | "published" | "hidden";

const quickFilters: { value: Quick; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "open", label: "Đang cần pass" },
  { value: "done", label: "Đã pass xong" },
  { value: "published", label: "Đang hiển thị" },
  { value: "hidden", label: "Đã ẩn" },
];

function normalizeText(s: string) {
  return stripDiacritics(s).toLowerCase();
}

export function AdminTransferTable({ posts }: { posts: TransferWithImages[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState<Quick>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<TransferWithImages | null>(null);
  const [isPending, startTransition] = useTransition();
  const [now] = useState(() => Date.now());

  useTransfersRealtime({ onChange: () => router.refresh() });

  const visible = useMemo(() => {
    const q = normalizeText(query.trim());
    return posts.filter((p) => {
      if (quick === "open" && p.is_transferred) return false;
      if (quick === "done" && !p.is_transferred) return false;
      if (quick === "published" && !p.is_published) return false;
      if (quick === "hidden" && p.is_published) return false;
      if (!q) return true;
      return normalizeText(`${p.title} ${p.address} ${p.district} ${p.slug} ${p.contact_name} ${p.contact_phone}`).includes(q);
    });
  }, [posts, query, quick]);

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
    all: posts.length,
    open: posts.filter((p) => !p.is_transferred).length,
    done: posts.filter((p) => p.is_transferred).length,
    published: posts.filter((p) => p.is_published).length,
    hidden: posts.filter((p) => !p.is_published).length,
  };

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
            placeholder="Tìm theo tiêu đề, địa chỉ, tên hoặc số điện thoại người đăng…"
            aria-label="Tìm kiếm tin pass phòng"
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

      {posts.length === 0 ? (
        <EmptyState
          title="Chưa có tin pass phòng nào"
          description="Khi khách đăng tin ở tab “Pass lại phòng”, tin sẽ hiện tại đây để bạn kiểm duyệt."
        />
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
          {visible.map((p) => {
            const cover = transferCover(p);
            const busy = isPending && pendingId === p.id;
            return (
              <li
                key={p.id}
                className={cn(
                  "grid gap-3 rounded-2xl border bg-white p-3 shadow-card sm:grid-cols-[96px_1fr] sm:p-4",
                  p.is_published ? "border-stone-200" : "border-dashed border-amber-300 bg-amber-50/40",
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
                    <TransferStatusBadge done={p.is_transferred} />
                    {p.is_published ? <Badge tone="brand">Đang hiển thị</Badge> : <Badge tone="hidden">Đã ẩn</Badge>}
                    <ContractBadge date={p.contract_end_date} now={now} withDate={false} />
                    <DepositBadge months={p.deposit_months} />
                    <span className="text-xs text-stone-400">Đăng {formatRelative(p.created_at, now)}</span>
                  </div>
                  <h2 className="mt-1.5 truncate text-base font-semibold text-ink">
                    <Link href={`/admin/pass-phong/${p.id}/chinh-sua`} className="hover:text-brand-700">
                      {p.title}
                    </Link>
                  </h2>
                  <p className="truncate text-sm text-muted">{p.address}</p>
                  <p className="mt-1 text-sm font-semibold text-accent-600">
                    {formatVND(p.price)}
                    <span className="font-normal text-muted">/tháng</span>
                    <span className="ml-3 font-normal text-muted">
                      Hết hạn {formatDate(`${p.contract_end_date}T00:00:00`)} · {p.images.length} ảnh
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted">
                    Người đăng: {p.contact_name} · {p.contact_phone}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/pass-phong/${p.id}/chinh-sua`}
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
                          p.id,
                          () => setTransferDone(p.id, !p.is_transferred),
                          p.is_transferred ? "Đã chuyển sang “Đang cần pass”" : "Đã chuyển sang “Đã pass xong”",
                        )
                      }
                    >
                      {p.is_transferred ? "Đánh dấu đang cần pass" : "Đánh dấu đã pass xong"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        run(
                          p.id,
                          () => setTransferPublished(p.id, !p.is_published),
                          p.is_published ? "Đã ẩn tin" : "Đã công khai tin",
                        )
                      }
                    >
                      {p.is_published ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                      {p.is_published ? "Ẩn tin" : "Công khai"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      disabled={busy}
                      onClick={() => setToDelete(p)}
                    >
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
        title="Xóa tin pass phòng này?"
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
          run(target.id, () => deleteTransferPost(target.id), "Đã xóa tin");
          setToDelete(null);
        }}
      />
    </div>
  );
}
