import Link from "next/link";
import { Bath, BedDouble, ImageOff, MapPin, Ruler } from "lucide-react";
import { SafeImage } from "@/components/listings/safe-image";
import { formatArea, formatRelative, formatVND } from "@/lib/format";
import { transferCover, type TransferWithImages } from "@/lib/transfers/types";
import { cn } from "@/lib/cn";
import { DistanceBadge } from "@/components/listings/distance-badge";
import { ContractBadge, DepositBadge, TransferStatusBadge } from "./transfer-badges";

type Props = { post: TransferWithImages; now: number; priority?: boolean };

export function TransferCard({ post, now, priority }: Props) {
  const cover = transferCover(post);
  const done = post.is_transferred;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-card transition-shadow",
        done ? "border-stone-200" : "border-amber-100 hover:shadow-card-hover",
      )}
    >
      <Link
        href={`/pass-phong/${post.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-stone-100"
        aria-label={`Xem chi tiết: ${post.title}`}
      >
        {cover ? (
          <SafeImage
            src={cover.url}
            alt={`Ảnh ${post.title}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-500",
              done ? "grayscale-[0.6] opacity-80" : "group-hover:scale-[1.03]",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            <ImageOff className="size-8" aria-hidden="true" />
            <span className="sr-only">Chưa có ảnh</span>
          </div>
        )}
        <TransferStatusBadge done={done} className="absolute left-3 top-3 shadow-sm" />
        {post.images.length > 1 ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2 py-1 text-xs font-medium text-white">
            {post.images.length} ảnh
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className={cn("text-xl font-bold tracking-tight", done ? "text-stone-500" : "text-accent-600")}>
            {formatVND(post.price)}
            <span className="text-sm font-medium text-muted">/tháng</span>
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-ink">
            <Link
              href={`/pass-phong/${post.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {post.title}
            </Link>
          </h3>
        </div>

        <p className="flex items-start gap-1.5 text-sm text-muted">
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
          <span className="line-clamp-2">{post.address}</span>
        </p>

        <div className="flex flex-wrap gap-1.5">
          <ContractBadge date={post.contract_end_date} now={now} withDate={false} />
          <DepositBadge months={post.deposit_months} />
          <DistanceBadge km={post.distance_to_school_km} />
        </div>

        <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink" aria-label="Thông số chính">
          <li className="flex items-center gap-1.5">
            <Ruler className="size-4 text-stone-400" aria-hidden="true" />
            {formatArea(post.area_m2)}
          </li>
          <li className="flex items-center gap-1.5">
            <BedDouble className="size-4 text-stone-400" aria-hidden="true" />
            {post.bedrooms} phòng ngủ
          </li>
          <li className="flex items-center gap-1.5">
            <Bath className="size-4 text-stone-400" aria-hidden="true" />
            {post.bathrooms} vệ sinh
          </li>
        </ul>

        <p className="text-xs text-stone-400">Đăng {formatRelative(post.created_at, now)}</p>
      </div>
    </article>
  );
}
