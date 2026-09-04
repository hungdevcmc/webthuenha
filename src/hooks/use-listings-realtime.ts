"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { REALTIME_EVENT, REALTIME_TOPIC, type ListingChangePayload } from "@/lib/listings/types";

type Options = {
  /** Được gọi khi có thay đổi (payload null = làm mới do focus/kết nối lại) */
  onChange: (payload: ListingChangePayload | null) => void;
  /** Chỉ quan tâm tới một tin cụ thể (trang chi tiết) */
  listingId?: string;
  /** Độ trễ gộp nhiều sự kiện liên tiếp (ms) */
  debounceMs?: number;
};

/**
 * Lắng nghe kênh broadcast công khai "listings" do trigger trong database phát ra.
 * - Gộp nhiều sự kiện liên tiếp thành một lần làm mới.
 * - Tự làm mới khi cửa sổ được focus lại hoặc khi kết nối realtime nối lại,
 *   để dữ liệu luôn đúng ngay cả khi realtime từng bị gián đoạn.
 * - Hủy đăng ký khi component unmount.
 */
export function useListingsRealtime({ onChange, listingId, debounceMs = 300 }: Options) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending: ListingChangePayload | null = null;
    let hasSubscribedOnce = false;

    const flush = () => {
      timer = null;
      const payload = pending;
      pending = null;
      onChangeRef.current(payload);
    };

    const schedule = (payload: ListingChangePayload | null) => {
      if (payload && listingId && payload.id !== listingId) return;
      pending = payload ?? pending;
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, debounceMs);
    };

    const channel = supabase
      .channel(REALTIME_TOPIC)
      .on("broadcast", { event: REALTIME_EVENT }, (message) => {
        schedule((message.payload ?? null) as ListingChangePayload | null);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Lần đầu: dữ liệu đã có từ server. Các lần sau: vừa kết nối lại -> tải mới.
          if (hasSubscribedOnce) schedule(null);
          hasSubscribedOnce = true;
        }
      });

    const onFocus = () => schedule(null);
    const onVisibility = () => {
      if (document.visibilityState === "visible") schedule(null);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      supabase.removeChannel(channel);
    };
  }, [listingId, debounceMs]);
}
