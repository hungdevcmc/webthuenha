import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, PenLine, Wallet, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { fetchPublicTransfers } from "@/lib/transfers/queries";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ListingGridSkeleton } from "@/components/listings/listing-skeleton";
import { MobileContactBar } from "@/components/listings/contact-bar";
import { TransferGrid } from "@/components/transfers/transfer-grid";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: siteConfig.transfer.title,
  description: siteConfig.transfer.intro,
  alternates: { canonical: "/pass-phong" },
  openGraph: {
    title: `${siteConfig.transfer.title} | ${siteConfig.name}`,
    description: siteConfig.transfer.intro,
    url: "/pass-phong",
  },
};

const points = [
  {
    icon: CalendarClock,
    title: "Rõ hạn hợp đồng",
    text: "Mỗi tin ghi rõ hợp đồng còn hạn tới ngày nào để bạn tính trước.",
  },
  {
    icon: Wallet,
    title: "Rõ mức cọc",
    text: "Biết ngay người nhận phải đóng cọc 1 tháng hay cọc 3 tháng.",
  },
  {
    icon: ShieldCheck,
    title: "Liên hệ trực tiếp",
    text: "Gọi thẳng cho người đang thuê, không qua trung gian, không mất phí.",
  },
];

async function TransferListings() {
  let posts = [] as Awaited<ReturnType<typeof fetchPublicTransfers>>;
  let error: string | null = null;
  try {
    const supabase = await createClient();
    posts = await fetchPublicTransfers(supabase);
  } catch (err) {
    error = err instanceof Error ? err.message : "Lỗi không xác định";
  }
  return <TransferGrid initialPosts={posts} initialError={error} />;
}

export default function TransferPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-amber-50 to-surface">
          <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">{siteConfig.name}</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              {siteConfig.transfer.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {siteConfig.transfer.intro}
            </p>

            <div className="mt-6">
              <Link href="/pass-phong/dang-tin" className={buttonClasses("accent", "lg")}>
                <PenLine className="size-5" aria-hidden="true" />
                Đăng tin pass phòng
              </Link>
              <p className="mt-2 text-sm text-muted">Miễn phí, không cần đăng ký tài khoản.</p>
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {points.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3 rounded-2xl border border-amber-100 bg-white/80 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    <p className="mt-0.5 text-sm text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-labelledby="transfer-heading">
          <h2 id="transfer-heading" className="mb-4 text-2xl font-bold tracking-tight text-ink">
            Phòng đang cần pass lại
          </h2>
          <Suspense fallback={<ListingGridSkeleton />}>
            <TransferListings />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
      <MobileContactBar phone={siteConfig.contact.phoneRaw} zalo={siteConfig.contact.phoneRaw} />
    </>
  );
}
