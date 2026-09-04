"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col items-center px-4 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="size-8" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-ink">Đã xảy ra lỗi</h1>
      <p className="mt-2 text-muted">Rất tiếc, trang không tải được. Vui lòng thử lại hoặc quay về trang chủ.</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Thử lại</Button>
        <Link href="/" className={buttonClasses("secondary")}>
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
