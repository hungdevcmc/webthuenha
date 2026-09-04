import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { siteConfig, telLink } from "@/config/site";

export function SiteFooter() {
  const tel = telLink(siteConfig.contact.phoneRaw);
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white pb-24 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-brand-800">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{siteConfig.description}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-ink">Liên hệ</p>
          <ul className="mt-2 space-y-2 text-muted">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
              {tel ? (
                <a href={tel} className="hover:text-brand-700">
                  {siteConfig.contact.phone}
                </a>
              ) : (
                siteConfig.contact.phone
              )}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
              {siteConfig.contact.hours}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
              {siteConfig.contact.address}
            </li>
          </ul>
        </div>
        <div className="text-sm text-muted md:text-right">
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
          <Link href="/admin" className="mt-2 inline-block text-xs text-stone-400 hover:text-stone-600">
            Trang quản trị
          </Link>
        </div>
      </div>
    </footer>
  );
}
