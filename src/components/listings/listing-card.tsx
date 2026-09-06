import Link from "next/link";
import { BedDouble, Bath, ImageOff, MapPin, Ruler } from "lucide-react";
import { formatArea, formatRelative, formatVND } from "@/lib/format";
import { coverImage, roommateInfo, type ListingWithImages } from "@/lib/listings/types";
import { cn } from "@/lib/cn";
import { SafeImage } from "./safe-image";
import { StatusBadge } from "./status-badge";
import { GenderBadge, RoommateBadge } from "./roommate-badge";
import { DistanceBadge } from "./distance-badge";
import { RoommateSignUpButton } from "./roommate-signup-button";

type Props = {
  listing: ListingWithImages;
  now: number;
  priority?: boolean;
  /** "roommate" hiển thị giá một chỗ ở ghép thay cho giá cả phòng */
  variant?: "all" | "roommate";
};

export function ListingCard({ listing, now, priority, variant = "all" }: Props) {
  const cover = coverImage(listing);
  const rented = !listing.is_available;
  const roommateMode = variant === "roommate";
  // Thông tin ở ghép chỉ xuất hiện ở tab "Tìm bạn ở ghép"
  const roommate = roommateMode ? roommateInfo(listing) : null;

  // Tab ghép luôn hiển thị giá một chỗ, không bao giờ lấy giá cả phòng.
  // Chưa đặt giá chỗ thì ghi "Liên hệ để biết giá" cho khỏi hiểu nhầm.
  const slotPrice = roommate?.slotPrice ?? 0;
  const showPrice = !roommateMode || slotPrice > 0;
  const price = roommateMode ? slotPrice : listing.price;
  const priceSuffix = roommateMode ? "/chỗ/tháng" : "/tháng";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-card transition-shadow",
        rented ? "border-stone-200" : "border-brand-100 hover:shadow-card-hover",
      )}
    >
      <Link
        href={`/phong/${listing.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-stone-100"
        aria-label={`Xem chi tiết: ${listing.title}`}
      >
        {cover ? (
          <SafeImage
            src={cover.url}
            alt={`Ảnh ${listing.title}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-500",
              rented ? "grayscale-[0.6] opacity-80" : "group-hover:scale-[1.03]",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            <ImageOff className="size-8" aria-hidden="true" />
            <span className="sr-only">Chưa có ảnh</span>
          </div>
        )}
        <StatusBadge isAvailable={listing.is_available} className="absolute left-3 top-3 shadow-sm" />
        {listing.images.length > 1 ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2 py-1 text-xs font-medium text-white">
            {listing.images.length} ảnh
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className={cn("text-xl font-bold tracking-tight", rented ? "text-stone-500" : "text-accent-600")}>
            {showPrice ? (
              <>
                {formatVND(price)}
                <span className="text-sm font-medium text-muted">{priceSuffix}</span>
              </>
            ) : (
              <span className="text-base font-semibold text-ink">Liên hệ để biết giá một chỗ</span>
            )}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-ink">
            <Link
              href={`/phong/${listing.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {listing.title}
            </Link>
          </h3>
        </div>

        <p className="flex items-start gap-1.5 text-sm text-muted">
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
          <span className="line-clamp-2">{listing.address}</span>
        </p>

        <div className="flex flex-wrap gap-1.5">
          <DistanceBadge km={listing.distance_to_school_km} />
          {roommate ? <GenderBadge info={roommate} /> : null}
          {roommate ? <RoommateBadge info={roommate} /> : null}
        </div>

        <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink" aria-label="Thông số chính">
          <li className="flex items-center gap-1.5">
            <Ruler className="size-4 text-stone-400" aria-hidden="true" />
            {formatArea(listing.area_m2)}
          </li>
          <li className="flex items-center gap-1.5">
            <BedDouble className="size-4 text-stone-400" aria-hidden="true" />
            {listing.bedrooms} phòng ngủ
          </li>
          <li className="flex items-center gap-1.5">
            <Bath className="size-4 text-stone-400" aria-hidden="true" />
            {listing.bathrooms} vệ sinh
          </li>
        </ul>

        {roommateMode && roommate && !rented ? (
          <RoommateSignUpButton listingTitle={listing.title} className="w-full" />
        ) : null}

        <p className="text-xs text-stone-400">Cập nhật {formatRelative(listing.updated_at, now)}</p>
      </div>
    </article>
  );
}
