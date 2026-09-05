"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users } from "lucide-react";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/", label: "Tất cả phòng", icon: Building2 },
  { href: "/o-ghep", label: "Tìm bạn ở ghép", icon: Users },
] as const;

/** Thanh tab chính của trang công khai */
export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Điều hướng chính" className="border-t border-stone-200/70">
      <ul className="mx-auto flex max-w-6xl gap-5 px-4 sm:gap-7 sm:px-6">
        {tabs.map(({ href, label, icon: Icon }) => {
          // Trang chi tiết phòng thuộc về tab "Tất cả phòng"
          const active = href === "/" ? pathname === "/" || pathname.startsWith("/phong") : pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors",
                  active
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-muted hover:border-stone-300 hover:text-ink",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
