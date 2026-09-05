import Link from "next/link";
import { Home, Phone } from "lucide-react";
import { siteConfig, telLink } from "@/config/site";
import { buttonClasses } from "@/components/ui/button";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  const tel = telLink(siteConfig.contact.phoneRaw);
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg font-bold text-brand-800">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Home className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg tracking-tight">{siteConfig.name}</span>
        </Link>
        {tel ? (
          <a href={tel} className={buttonClasses("primary", "sm", "hidden sm:inline-flex")}>
            <Phone className="size-4" aria-hidden="true" />
            {siteConfig.contact.phone}
          </a>
        ) : null}
      </div>
      <SiteNav />
    </header>
  );
}
