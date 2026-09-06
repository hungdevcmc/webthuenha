"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { REALTIME_EVENT } from "@/lib/listings/types";
import { TRANSFER_REALTIME_TOPIC, type TransferChangePayload } from "@/lib/transfers/types";

type Options = {
  /** Được gọi khi có thay đổi (payload null = làm mới do focus/kết nối lại) */
  onChange: (payload: TransferChangePayload | null) => void;
  /** Chỉ quan tâm tới một tin cụ thể (trang chi tiết) */
  postId?: string;
  /** Độ trễ gộp nhiều sự kiện liên tiếp (ms) */
  debounceMs?: number;
};

/**
 * Lắng nghe kênh broadcast công khai "transfers" do trigger trong database phát ra.
 * Cùng cơ chế với useListingsRealtime nhưng dùng kênh riêng, để thay đổi ở tin
 * pass phòng không làm trang danh sách phòng tải lại vô ích.
 */
export function useTransfersRealtime({ onChange, postId, debounceMs = 300 }: Options) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending: TransferChangePayload | null = null;
    let hasSubscribedOnce = false;

    const flush = () => {
      timer = null;
      const payload = pending;
      pending = null;
      onChangeRef.current(payload);
    };

    const schedule = (payload: TransferChangePayload | null) => {
      if (payload && postId && payload.id !== postId) return;
      pending = payload ?? pending;
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, debounceMs);
    };

    const channel = supabase
      .channel(TRANSFER_REALTIME_TOPIC)
      .on("broadcast", { event: REALTIME_EVENT }, (message) => {
        schedule((message.payload ?? null) as TransferChangePayload | null);
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
  }, [postId, debounceMs]);
}
