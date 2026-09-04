import { Suspense } from "react";
import { BadgeCheck, Handshake, ReceiptText } from "lucide-react";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { fetchPublicListings } from "@/lib/listings/queries";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ListingGrid } from "@/components/listings/listing-grid";
import { ListingGridSkeleton } from "@/components/listings/listing-skeleton";
import { MobileContactBar } from "@/components/listings/contact-bar";

const trustPoints = [
  { icon: BadgeCheck, title: "Chính chủ, không môi giới", text: "Bạn làm việc trực tiếp với chủ nhà, không mất phí trung gian." },
  { icon: ReceiptText, title: "Giá và phí công khai", text: "Tiền cọc, điện, nước, dịch vụ ghi rõ trong từng tin." },
  { icon: Handshake, title: "Xem phòng miễn phí", text: "Gọi hoặc nhắn Zalo để hẹn giờ xem phòng trong ngày." },
];

async function Listings() {
  let listings = [] as Awaited<ReturnType<typeof fetchPublicListings>>;
  let error: string | null = null;
  try {
    const supabase = await createClient();
    listings = await fetchPublicListings(supabase);
  } catch (err) {
    error = err instanceof Error ? err.message : "Lỗi không xác định";
  }
  return <ListingGrid initialListings={listings} initialError={error} />;
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-brand-50 to-surface">
          <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">{siteConfig.name}</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              {siteConfig.tagline}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{siteConfig.intro}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {trustPoints.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3 rounded-2xl border border-brand-100 bg-white/80 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
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

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-labelledby="listings-heading">
          <h2 id="listings-heading" className="mb-4 text-2xl font-bold tracking-tight text-ink">
            Phòng đang cho thuê
          </h2>
          <Suspense fallback={<ListingGridSkeleton />}>
            <Listings />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
      <MobileContactBar phone={siteConfig.contact.phoneRaw} zalo={siteConfig.contact.phoneRaw} />
    </>
  );
}
