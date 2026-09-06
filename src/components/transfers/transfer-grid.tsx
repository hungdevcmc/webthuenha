"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchPublicTransfers } from "@/lib/transfers/queries";
import {
  applyTransferFilter,
  DEFAULT_TRANSFER_FILTER,
  type TransferFilter,
  type TransferWithImages,
} from "@/lib/transfers/types";
import type { TransferKind } from "@/lib/transfers/schema";
import { useTransfersRealtime } from "@/hooks/use-transfers-realtime";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/listings/empty-state";
import { TransferCard } from "./transfer-card";
import { TransferFilters } from "./transfer-filters";

type Props = {
  initialPosts: TransferWithImages[];
  /** Lỗi khi tải ở server (nếu có) */
  initialError?: string | null;
  /** "room" là pass cả phòng, "slot" là pass slot trong phòng */
  kind?: TransferKind;
};

/**
 * Danh sách tin pass phòng ở trang công khai. Nhận dữ liệu ban đầu từ server,
 * sau đó tự đồng bộ qua Realtime mà không tải lại trang.
 */
export function TransferGrid({ initialPosts, initialError = null, kind = "room" }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [error, setError] = useState<string | null>(initialError);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<TransferFilter>(DEFAULT_TRANSFER_FILTER);
  const [now, setNow] = useState(() => Date.now());

  // Cập nhật "x phút trước" mỗi phút
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Đánh số từng lượt tải để kết quả về muộn của lượt cũ không ghi đè lượt mới
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setRefreshing(true);
    try {
      const supabase = createClient();
      const data = await fetchPublicTransfers(supabase, kind);
      if (id !== requestId.current) return;
      setPosts(data);
      setError(null);
      setNow(Date.now());
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu.");
    } finally {
      if (id === requestId.current) setRefreshing(false);
    }
  }, [kind]);

  useTransfersRealtime({ onChange: () => void refresh() });

  const districts = useMemo(
    () => Array.from(new Set(posts.map((p) => p.district))).sort((a, b) => a.localeCompare(b, "vi")),
    [posts],
  );
  const visible = useMemo(() => applyTransferFilter(posts, filter, now), [posts, filter, now]);

  return (
    <div className="space-y-6">
      <TransferFilters
        filter={filter}
        districts={districts}
        onChange={setFilter}
        resultCount={visible.length}
      />

      {error ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-center gap-2">
            <WifiOff className="size-4 shrink-0" aria-hidden="true" />
            Không tải được danh sách tin pass phòng. {error}
          </p>
          <Button variant="secondary" size="sm" onClick={() => void refresh()} disabled={refreshing}>
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
            Thử lại
          </Button>
        </div>
      ) : null}

      {posts.length === 0 && !error ? (
        <EmptyState
          title={kind === "slot" ? "Chưa có ai đăng tin pass slot" : "Chưa có ai đăng tin pass phòng"}
          description={
            kind === "slot"
              ? "Bạn đang ở ghép và muốn nhượng lại chỗ của mình? Hãy là người đăng tin đầu tiên, chỉ mất khoảng hai phút."
              : "Bạn đang cần nhượng lại phòng đang thuê? Hãy là người đăng tin đầu tiên, chỉ mất khoảng hai phút."
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Không có tin nào phù hợp với bộ lọc"
          description="Thử nới rộng khoảng giá, chọn mức cọc khác hoặc xóa bộ lọc để xem tất cả tin pass phòng."
          actionLabel="Xem tất cả tin"
          onAction={() => setFilter(DEFAULT_TRANSFER_FILTER)}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy={refreshing}>
          {visible.map((post, index) => (
            <TransferCard key={post.id} post={post} now={now} priority={index < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
