"use client";

import { useRouter } from "next/navigation";
import { useListingsRealtime } from "@/hooks/use-listings-realtime";

/** Ở trang chi tiết: khi tin này thay đổi, tải lại dữ liệu server mà không đổi vị trí cuộn */
export function ListingRealtimeRefresh({ listingId }: { listingId: string }) {
  const router = useRouter();
  useListingsRealtime({
    listingId,
    onChange: () => router.refresh(),
  });
  return null;
}
