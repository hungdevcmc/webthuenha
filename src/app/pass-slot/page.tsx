import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, PenLine, ShieldCheck, Users } from "lucide-react";
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
  title: siteConfig.slotTransfer.title,
  description: siteConfig.slotTransfer.intro,
  alternates: { canonical: "/pass-slot" },
  openGraph: {
    title: `${siteConfig.slotTransfer.title} | ${siteConfig.name}`,
    description: siteConfig.slotTransfer.intro,
    url: "/pass-slot",
  },
};

const points = [
  {
    icon: Users,
    title: "Rõ số slot",
    text: "Mỗi tin ghi rõ pass mấy slot và hiện có mấy người đang ở trong phòng.",
  },
  {
    icon: CalendarClock,
    title: "Rõ hạn hợp đồng",
    text: "Biết trước hợp đồng còn hạn tới ngày nào và phải đóng cọc mấy tháng.",
  },
  {
    icon: ShieldCheck,
    title: "Liên hệ trực tiếp",
    text: "Gọi thẳng cho bạn đang ở, không qua trung gian, không mất phí.",
  },
];

async function SlotListings() {
  let posts = [] as Awaited<ReturnType<typeof fetchPublicTransfers>>;
  let error: string | null = null;
  try {
    const supabase = await createClient();
    posts = await fetchPublicTransfers(supabase, "slot");
  } catch (err) {
    error = err instanceof Error ? err.message : "Lỗi không xác định";
  }
  return <TransferGrid initialPosts={posts} initialError={error} kind="slot" />;
}

export default function SlotTransferPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-violet-50 to-surface">
          <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">{siteConfig.name}</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              {siteConfig.slotTransfer.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {siteConfig.slotTransfer.intro}
            </p>

            <div className="mt-6">
              <Link href="/pass-slot/dang-tin" className={buttonClasses("accent", "lg")}>
                <PenLine className="size-5" aria-hidden="true" />
                Đăng tin pass slot
              </Link>
              <p className="mt-2 text-sm text-muted">Miễn phí, không cần đăng ký tài khoản.</p>
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {points.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3 rounded-2xl border border-violet-100 bg-white/80 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
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

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-labelledby="slot-heading">
          <h2 id="slot-heading" className="mb-4 text-2xl font-bold tracking-tight text-ink">
            Slot đang cần pass lại
          </h2>
          <Suspense fallback={<ListingGridSkeleton />}>
            <SlotListings />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
      <MobileContactBar phone={siteConfig.contact.phoneRaw} zalo={siteConfig.contact.phoneRaw} />
    </>
  );
}
