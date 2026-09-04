"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchPublicListings } from "@/lib/listings/queries";
import { applyFilter, DEFAULT_FILTER, type ListingFilter, type ListingWithImages } from "@/lib/listings/types";
import { useListingsRealtime } from "@/hooks/use-listings-realtime";
import { Button } from "@/components/ui/button";
import { ListingCard } from "./listing-card";
import { ListingFilters } from "./listing-filters";
import { EmptyState } from "./empty-state";

type Props = {
  initialListings: ListingWithImages[];
  /** Lỗi khi tải ở server (nếu có) */
  initialError?: string | null;
};

/**
 * Danh sách tin ở trang chủ. Nhận dữ liệu ban đầu từ server,
 * sau đó tự đồng bộ qua Realtime mà không tải lại trang.
 */
export function ListingGrid({ initialListings, initialError = null }: Props) {
  const [listings, setListings] = useState(initialListings);
  const [error, setError] = useState<string | null>(initialError);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ListingFilter>(DEFAULT_FILTER);
  const [now, setNow] = useState(() => Date.now());

  // Cập nhật "x phút trước" mỗi phút
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const supabase = createClient();
      const data = await fetchPublicListings(supabase);
      setListings(data);
      setError(null);
      setNow(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useListingsRealtime({ onChange: () => void refresh() });

  const districts = useMemo(
    () => Array.from(new Set(listings.map((l) => l.district))).sort((a, b) => a.localeCompare(b, "vi")),
    [listings],
  );
  const visible = useMemo(() => applyFilter(listings, filter), [listings, filter]);

  return (
    <div className="space-y-6">
      <ListingFilters filter={filter} districts={districts} onChange={setFilter} resultCount={visible.length} />

      {error ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <WifiOff className="size-4 shrink-0" aria-hidden="true" />
            Không tải được danh sách phòng. {error}
          </p>
          <Button variant="secondary" size="sm" onClick={() => void refresh()} disabled={refreshing}>
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
            Thử lại
          </Button>
        </div>
      ) : null}

      {listings.length === 0 && !error ? (
        <EmptyState
          title="Hiện chưa có phòng nào được đăng"
          description="Vui lòng quay lại sau hoặc gọi trực tiếp cho chúng tôi để được tư vấn phòng phù hợp."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Không có phòng phù hợp với bộ lọc"
          description="Thử nới rộng khoảng giá, chọn khu vực khác hoặc xóa bộ lọc để xem tất cả phòng đang có."
          actionLabel="Xem tất cả phòng"
          onAction={() => setFilter(DEFAULT_FILTER)}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy={refreshing}>
          {visible.map((listing, index) => (
            <ListingCard key={listing.id} listing={listing} now={now} priority={index < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
