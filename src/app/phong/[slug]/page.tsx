import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarClock,
  Check,
  Droplets,
  Layers,
  MapPin,
  Navigation,
  Phone,
  ReceiptText,
  Ruler,
  Users,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { fetchPublicListingBySlug } from "@/lib/listings/queries";
import { coverImage, roommateInfo } from "@/lib/listings/types";
import { formatArea, formatDateTime, formatDistance, formatPhone, formatUnitPrice, formatVND } from "@/lib/format";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ImageGallery } from "@/components/listings/image-gallery";
import { StatusBadge } from "@/components/listings/status-badge";
import { ContactButtons, MobileContactBar } from "@/components/listings/contact-bar";
import { ListingRealtimeRefresh } from "@/components/listings/listing-realtime-refresh";
import { DistanceBadge } from "@/components/listings/distance-badge";
import { RoommateSignUpButton } from "@/components/listings/roommate-signup-button";

type Props = PageProps<"/phong/[slug]">;

async function loadListing(slug: string) {
  const supabase = await createClient();
  return fetchPublicListingBySlug(supabase, slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await loadListing(slug).catch(() => null);
  if (!listing) return { title: "Không tìm thấy phòng" };
  const cover = coverImage(listing);
  const description = `${formatVND(listing.price)}/tháng · ${formatArea(listing.area_m2)} · ${listing.bedrooms} phòng ngủ · ${listing.address}`;
  return {
    title: listing.title,
    description,
    alternates: { canonical: `/phong/${listing.slug}` },
    openGraph: {
      title: listing.title,
      description,
      type: "article",
      images: cover ? [{ url: cover.url, alt: listing.title }] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await loadListing(slug);
  if (!listing) notFound();

  const rented = !listing.is_available;
  const zalo = listing.contact_zalo;
  const roommate = roommateInfo(listing);

  const specs = [
    { icon: Ruler, label: "Diện tích", value: formatArea(listing.area_m2) },
    { icon: BedDouble, label: "Phòng ngủ", value: `${listing.bedrooms}` },
    { icon: Bath, label: "Nhà vệ sinh", value: `${listing.bathrooms}` },
    {
      icon: Layers,
      label: "Tầng",
      value: listing.floor !== null ? `Tầng ${listing.floor}${listing.total_floors ? ` / ${listing.total_floors}` : ""}` : "—",
    },
    { icon: Building2, label: "Tổng số tầng", value: listing.total_floors !== null ? `${listing.total_floors} tầng` : "—" },
    {
      icon: Navigation,
      label: `Cách ${siteConfig.school.shortName}`,
      value: formatDistance(listing.distance_to_school_km) ?? "—",
    },
  ];

  const costs = [
    { icon: ReceiptText, label: "Tiền đặt cọc", value: listing.deposit > 0 ? formatVND(listing.deposit) : "Không cần cọc" },
    { icon: Zap, label: "Tiền điện", value: formatUnitPrice(listing.electricity_price, listing.electricity_unit) },
    { icon: Droplets, label: "Tiền nước", value: formatUnitPrice(listing.water_price, listing.water_unit) },
    {
      icon: ShieldCheck,
      label: "Phí dịch vụ",
      value: listing.service_fee_included
        ? `Đã bao gồm trong giá thuê${listing.service_fee > 0 ? ` (${formatVND(listing.service_fee)}/tháng)` : ""}`
        : listing.service_fee > 0
          ? `${formatVND(listing.service_fee)}/tháng (chưa gồm trong giá thuê)`
          : "Không có",
    },
  ];

  return (
    <>
      <SiteHeader />
      <ListingRealtimeRefresh listingId={listing.id} />
      <main className="mx-auto max-w-6xl flex-1 px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-brand-700 hover:text-brand-800">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Tất cả phòng
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
          <article className="min-w-0 space-y-8">
            <ImageGallery images={listing.images} title={listing.title} />

            <header>
              <StatusBadge isAvailable={listing.is_available} />
              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">{listing.title}</h1>
              <p className="mt-2 flex items-start gap-1.5 text-muted">
                <MapPin className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span>{listing.address}</span>
              </p>
              {formatDistance(listing.distance_to_school_km) ? (
                <div className="mt-2">
                  <DistanceBadge km={listing.distance_to_school_km} full />
                </div>
              ) : null}
              <p className="mt-4 text-3xl font-bold tracking-tight text-accent-600">
                {formatVND(listing.price)}
                <span className="text-base font-medium text-muted">/tháng</span>
              </p>
              {rented ? (
                <p className="mt-3 rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
                  Phòng này hiện đã có người thuê. Bạn có thể xem các phòng khác đang còn trống ở{" "}
                  <Link href="/" className="font-semibold text-brand-700 underline">
                    trang chủ
                  </Link>
                  .
                </p>
              ) : null}
            </header>

            <section aria-labelledby="specs-heading">
              <h2 id="specs-heading" className="text-lg font-bold text-ink">
                Thông số
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border border-stone-200 bg-white p-3.5">
                    <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
                      <Icon className="size-4 text-brand-600" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="mt-1 font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="costs-heading">
              <h2 id="costs-heading" className="text-lg font-bold text-ink">
                Chi phí hằng tháng
              </h2>
              <dl className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
                {costs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="flex items-center gap-2 text-sm text-muted">
                      <Icon className="size-4 text-brand-600" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="text-right text-sm font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {listing.amenities.length > 0 ? (
              <section aria-labelledby="amenities-heading">
                <h2 id="amenities-heading" className="text-lg font-bold text-ink">
                  Nội thất và tiện nghi
                </h2>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {listing.amenities.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-ink">
                      <Check className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {roommate ? (
              <section aria-labelledby="roommate-heading" className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 sm:p-5">
                <h2 id="roommate-heading" className="flex items-center gap-2 text-lg font-bold text-ink">
                  <Users className="size-5 text-sky-700" aria-hidden="true" />
                  Đang tìm bạn ở ghép
                </h2>
                <p className="mt-2 text-ink">
                  Hiện có <strong className="font-semibold">{roommate.total} người</strong> sẵn sàng ở ghép tại phòng này
                  {roommate.total > 0 ? <> ({roommate.label})</> : null}.
                </p>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-sky-100">
                    <dt className="text-xs font-medium text-muted">Giá một chỗ ở ghép</dt>
                    <dd className="mt-0.5 text-2xl font-bold text-accent-600">
                      {roommate.slotPrice > 0 ? (
                        <>
                          {formatVND(roommate.slotPrice)}
                          <span className="text-sm font-medium text-muted">/tháng</span>
                        </>
                      ) : (
                        <span className="text-lg text-ink">Liên hệ để biết giá</span>
                      )}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-sky-100">
                    <dt className="text-xs font-medium text-muted">Phòng dành cho</dt>
                    <dd className="mt-0.5 text-2xl font-bold text-ink">{roommate.genderText}</dd>
                  </div>
                </dl>
                <dl className="mt-3 grid grid-cols-2 gap-3 sm:max-w-sm">
                  <div className="rounded-xl bg-white p-3 text-center ring-1 ring-inset ring-sky-100">
                    <dt className="text-xs font-medium text-muted">Bạn nam</dt>
                    <dd className="mt-0.5 text-2xl font-bold text-ink">{roommate.male}</dd>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center ring-1 ring-inset ring-sky-100">
                    <dt className="text-xs font-medium text-muted">Bạn nữ</dt>
                    <dd className="mt-0.5 text-2xl font-bold text-ink">{roommate.female}</dd>
                  </div>
                </dl>
                {roommate.note ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">{roommate.note}</p>
                ) : null}
                {!rented ? (
                  <div className="mt-4">
                    <RoommateSignUpButton listingTitle={listing.title} size="lg" className="w-full sm:w-auto" />
                    <p className="mt-2 text-xs text-muted">
                      Bấm để nhắn Zalo cho {siteConfig.contact.name} và giữ chỗ ở ghép.
                    </p>
                  </div>
                ) : null}
              </section>
            ) : null}

            <section aria-labelledby="desc-heading">
              <h2 id="desc-heading" className="text-lg font-bold text-ink">
                Mô tả chi tiết
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">{listing.description}</p>
            </section>

            <p className="flex items-center gap-1.5 text-sm text-stone-400">
              <CalendarClock className="size-4" aria-hidden="true" />
              Cập nhật lần cuối: {formatDateTime(listing.updated_at)}
            </p>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
              <h2 className="text-base font-bold text-ink">Liên hệ xem phòng</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Người liên hệ</dt>
                  <User className="size-4 text-brand-600" aria-hidden="true" />
                  <dd className="font-medium text-ink">{listing.contact_name}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Số điện thoại</dt>
                  <Phone className="size-4 text-brand-600" aria-hidden="true" />
                  <dd className="font-medium text-ink">{formatPhone(listing.contact_phone)}</dd>
                </div>
              </dl>
              <ContactButtons
                phone={listing.contact_phone}
                zalo={zalo}
                disabled={rented}
                disabledText="Phòng đã cho thuê, tạm ngừng nhận liên hệ."
                className="mt-4"
              />
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Gọi trong khung giờ {siteConfig.contact.hours}. Không thu phí xem phòng.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
      <MobileContactBar
        phone={listing.contact_phone}
        zalo={zalo}
        disabled={rented}
        disabledText="Phòng đã cho thuê, tạm ngừng nhận liên hệ."
      />
    </>
  );
}
