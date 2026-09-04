"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = Omit<ImageProps, "onError"> & {
  /** Kích thước icon khi ảnh không tải được */
  fallbackIconClass?: string;
};

/**
 * Ảnh có trạng thái dự phòng: nếu file không tải được (đã bị xóa khỏi Storage,
 * mất mạng, đường dẫn sai) thì hiển thị khung xám thay vì biểu tượng ảnh vỡ.
 */
export function SafeImage({ className, fallbackIconClass, alt, ...props }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={cn("absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400", className)}
        role="img"
        aria-label={typeof alt === "string" && alt ? `${alt} (ảnh không tải được)` : "Ảnh không tải được"}
      >
        <ImageOff className={fallbackIconClass ?? "size-8"} aria-hidden="true" />
      </span>
    );
  }

  return <Image alt={alt} className={className} onError={() => setFailed(true)} {...props} />;
}
