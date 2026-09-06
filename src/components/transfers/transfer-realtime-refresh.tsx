"use client";

import { useRouter } from "next/navigation";
import { useTransfersRealtime } from "@/hooks/use-transfers-realtime";

/** Ở trang chi tiết: khi tin này thay đổi, tải lại dữ liệu server mà không đổi vị trí cuộn */
export function TransferRealtimeRefresh({ postId }: { postId: string }) {
  const router = useRouter();
  useTransfersRealtime({
    postId,
    onChange: () => router.refresh(),
  });
  return null;
}
