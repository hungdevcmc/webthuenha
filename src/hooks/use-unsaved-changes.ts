"use client";

import { useEffect } from "react";

const MESSAGE = "Bạn có thay đổi chưa lưu. Rời trang sẽ mất các thay đổi này. Tiếp tục?";

/**
 * Cảnh báo khi rời form còn thay đổi chưa lưu:
 * - Đóng tab / tải lại trang: dùng sự kiện beforeunload của trình duyệt.
 * - Bấm vào liên kết nội bộ: chặn và hỏi xác nhận.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href.startsWith("/") || anchor.getAttribute("target") === "_blank") return;
      if (!window.confirm(MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [isDirty]);
}
