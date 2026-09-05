import { Suspense } from "react";
import type { Metadata } from "next";
import { Users, Wallet, UserCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { fetchPublicListings } from "@/lib/listings/queries";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ListingGrid } from "@/components/listings/listing-grid";
import { ListingGridSkeleton } from "@/components/listings/listing-skeleton";
import { MobileContactBar } from "@/components/listings/contact-bar";

export const metadata: Metadata = {
  title: siteConfig.roommate.title,
  description: siteConfig.roommate.intro,
  alternates: { canonical: "/o-ghep" },
  openGraph: {
    title: `${siteConfig.roommate.title} | ${siteConfig.name}`,
    description: siteConfig.roommate.intro,
    url: "/o-ghep",
  },
};

const points = [
  { icon: Wallet, title: "Chia tiền thuê", text: "Ở ghép giúp giảm đáng kể tiền phòng và tiền dịch vụ mỗi tháng." },
  { icon: UserCheck, title: "Biết trước người ở cùng", text: "Mỗi tin ghi rõ hiện có mấy bạn nam, mấy bạn nữ trong phòng." },
  { icon: Users, title: "Liên hệ trực tiếp", text: "Gọi hoặc nhắn Zalo cho chủ nhà để hỏi thêm và hẹn xem phòng." },
];

async function RoommateListings() {
  let listings = [] as Awaited<ReturnType<typeof fetchPublicListings>>;
  let error: string | null = null;
  try {
    const supabase = await createClient();
    listings = await fetchPublicListings(supabase);
  } catch (err) {
    error = err instanceof Error ? err.message : "Lỗi không xác định";
  }
  return <ListingGrid initialListings={listings} initialError={error} variant="roommate" />;
}

export default function RoommatePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-sky-50 to-surface">
          <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">{siteConfig.name}</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              {siteConfig.roommate.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {siteConfig.roommate.intro}
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {points.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3 rounded-2xl border border-sky-100 bg-white/80 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
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

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-labelledby="roommate-heading">
          <h2 id="roommate-heading" className="mb-4 text-2xl font-bold tracking-tight text-ink">
            Phòng đang cần người ở ghép
          </h2>
          <Suspense fallback={<ListingGridSkeleton />}>
            <RoommateListings />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
      <MobileContactBar phone={siteConfig.contact.phoneRaw} zalo={siteConfig.contact.phoneRaw} />
    </>
  );
}
