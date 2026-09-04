"use client";

import { useEffect, useRef } from "react";
import { Button } from "./button";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Hộp thoại xác nhận dùng thẻ <dialog> gốc: hỗ trợ bàn phím và focus trap */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  danger,
  busy,
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-stone-200 bg-white p-0 shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="text-lg font-bold text-ink">
          {title}
        </h2>
        <p id="confirm-desc" className="mt-2 text-sm leading-relaxed text-muted">
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy} autoFocus>
            {busy ? "Đang xử lý…" : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
