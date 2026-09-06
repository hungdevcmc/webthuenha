import Link from "next/link";
import { ExternalLink, LayoutList, Plus, Repeat2, Users } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buttonClasses } from "@/components/ui/button";
import { SignOutButton } from "./sign-out-button";

export function AdminHeader({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2 rounded-lg font-bold text-brand-800">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <LayoutList className="size-5" aria-hidden="true" />
            </span>
            <span className="hidden sm:inline">Quản trị {siteConfig.name}</span>
            <span className="sm:hidden">Quản trị</span>
          </Link>
        </div>
        <nav className="flex items-center gap-2" aria-label="Quản trị">
          <Link href="/admin/o-ghep" className={buttonClasses("ghost", "sm")}>
            <Users className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Tìm bạn ở ghép</span>
            <span className="sm:hidden">Ở ghép</span>
          </Link>
          <Link href="/admin/pass-phong" className={buttonClasses("ghost", "sm")}>
            <Repeat2 className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Tin pass phòng</span>
            <span className="sm:hidden">Pass phòng</span>
          </Link>
          <Link href="/" target="_blank" rel="noopener" className={buttonClasses("ghost", "sm", "hidden md:inline-flex")}>
            <ExternalLink className="size-4" aria-hidden="true" />
            Xem trang công khai
          </Link>
          <Link href="/admin/phong-moi" className={buttonClasses("primary", "sm")}>
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Đăng tin mới</span>
            <span className="sm:hidden">Tin mới</span>
          </Link>
          <SignOutButton compact email={email} />
        </nav>
      </div>
    </header>
  );
}
