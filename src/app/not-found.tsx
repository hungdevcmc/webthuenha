import Link from "next/link";
import { Compass } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center px-4 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Compass className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink">Không tìm thấy trang</h1>
        <p className="mt-2 text-muted">Tin đăng này có thể đã bị gỡ hoặc đường dẫn không đúng.</p>
        <Link href="/" className={buttonClasses("primary", "md", "mt-6")}>
          Về trang chủ
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
