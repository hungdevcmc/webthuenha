import Link from "next/link";
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
  ShieldCheck,
  UserRound,
  User,
  Users,
  Zap,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  contractRemainingLabel,
  depositLabel,
  kindBasePath,
  priceSuffix,
  roomGenderLabel,
  type TransferWithImages,
} from "@/lib/transfers/types";
import { formatArea, formatDate, formatDateTime, formatDistance, formatPhone, formatUnitPrice, formatVND } from "@/lib/format";
import { ImageGallery } from "@/components/listings/image-gallery";
import { ContactButtons, MobileContactBar } from "@/components/listings/contact-bar";
import { DistanceBadge } from "@/components/listings/distance-badge";
import { ReportLink } from "@/components/site/report-link";
import { ContractBadge, DepositBadge, RoomGenderBadge, SlotBadge, TransferStatusBadge } from "./transfer-badges";
import { TransferRealtimeRefresh } from "./transfer-realtime-refresh";

type Props = {
  post: TransferWithImages;
  /** Mốc thời gian tính ở server để nhãn hạn hợp đồng không lệch khi hydrate */
  now: number;
};

/**
 * Nội dung trang chi tiết, dùng chung cho tin pass cả phòng và tin pass slot.
 * Phần khác nhau giữa hai loại nằm gọn trong các nhánh `isSlot` bên dưới.
 */
export function TransferDetail({ post, now }: Props) {
  const done = post.is_transferred;
  const isSlot = post.kind === "slot";
  const base = kindBasePath(post.kind);
  const backLabel = isSlot ? "Tất cả tin pass slot" : "Tất cả tin pass phòng";
  const doneText = isSlot ? "Slot này đã pass được cho người khác." : "Phòng này đã pass được cho người khác.";

  const specs = [
    { icon: Ruler, label: "Diện tích", value: formatArea(post.area_m2) },
    { icon: BedDouble, label: "Phòng ngủ", value: `${post.bedrooms}` },
    { icon: Bath, label: "Nhà vệ sinh", value: `${post.bathrooms}` },
    {
      icon: Layers,
      label: "Tầng",
      value: post.floor !== null ? `Tầng ${post.floor}${post.total_floors ? ` / ${post.total_floors}` : ""}` : "—",
    },
    { icon: Building2, label: "Tổng số tầng", value: post.total_floors !== null ? `${post.total_floors} tầng` : "—" },
    {
      icon: Navigation,
      label: `Cách ${siteConfig.school.shortName}`,
      value: formatDistance(post.distance_to_school_km) ?? "—",
    },
  ];

  const costs = [
    { icon: ReceiptText, label: "Số tiền cọc", value: post.deposit > 0 ? formatVND(post.deposit) : "Không cần cọc" },
    { icon: Zap, label: "Tiền điện", value: formatUnitPrice(post.electricity_price, post.electricity_unit) },
    { icon: Droplets, label: "Tiền nước", value: formatUnitPrice(post.water_price, post.water_unit) },
    {
      icon: ShieldCheck,
      label: "Phí dịch vụ",
      value: post.service_fee_included
        ? `Đã bao gồm trong giá thuê${post.service_fee > 0 ? ` (${formatVND(post.service_fee)}/tháng)` : ""}`
        : post.service_fee > 0
          ? `${formatVND(post.service_fee)}/tháng (chưa gồm trong giá thuê)`
          : "Không có",
    },
  ];

  return (
    <>
      <TransferRealtimeRefresh postId={post.id} />
      <main className="mx-auto max-w-6xl flex-1 px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <Link
          href={base}
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
          <article className="min-w-0 space-y-8">
            <ImageGallery images={post.images} title={post.title} />

            <header>
              <TransferStatusBadge done={done} />
              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">{post.title}</h1>
              <p className="mt-2 flex items-start gap-1.5 text-muted">
                <MapPin className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span>{post.address}</span>
              </p>
              {formatDistance(post.distance_to_school_km) ? (
                <div className="mt-2">
                  <DistanceBadge km={post.distance_to_school_km} full />
                </div>
              ) : null}
              <p className="mt-4 text-3xl font-bold tracking-tight text-accent-600">
                {formatVND(post.price)}
                <span className="text-base font-medium text-muted">{priceSuffix(post.kind)}</span>
              </p>
              {done ? (
                <p className="mt-3 rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
                  {doneText} Bạn có thể xem các tin còn lại ở{" "}
                  <Link href={base} className="font-semibold text-brand-700 underline">
                    danh sách {isSlot ? "pass slot" : "pass phòng"}
                  </Link>
                  .
                </p>
              ) : null}
            </header>

            {isSlot ? (
              <section
                aria-labelledby="slot-info-heading"
                className="rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-4 sm:p-5"
              >
                <h2 id="slot-info-heading" className="flex items-center gap-2 text-lg font-bold text-ink">
                  <Users className="size-5 text-violet-700" aria-hidden="true" />
                  Slot đang được nhượng lại
                </h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-violet-100">
                    <dt className="text-xs font-medium text-muted">Số slot pass lại</dt>
                    <dd className="mt-0.5 text-2xl font-bold text-ink">{post.slot_count ?? 1} slot</dd>
                  </div>
                  <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-violet-100">
                    <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
                      <UserRound className="size-3.5" aria-hidden="true" />
                      Phòng dành cho
                    </dt>
                    <dd className="mt-0.5 text-2xl font-bold text-ink">{roomGenderLabel(post.room_gender)}</dd>
                  </div>
                  <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-violet-100">
                    <dt className="text-xs font-medium text-muted">Đang ở trong phòng</dt>
                    <dd className="mt-0.5 text-2xl font-bold text-ink">
                      {post.people_in_room > 0 ? `${post.people_in_room} người` : "Chưa có ai"}
                    </dd>
                  </div>
                </dl>
              </section>
            ) : null}

            <section
              aria-labelledby="transfer-terms-heading"
              className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-4 sm:p-5"
            >
              <h2 id="transfer-terms-heading" className="text-lg font-bold text-ink">
                {isSlot ? "Điều kiện nhận lại slot" : "Điều kiện nhận lại phòng"}
              </h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-amber-100">
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
                    <CalendarClock className="size-4 text-amber-700" aria-hidden="true" />
                    Hợp đồng hết hạn
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-ink">
                    {formatDate(`${post.contract_end_date}T00:00:00`)}
                  </dd>
                  <dd className="text-sm text-muted">{contractRemainingLabel(post.contract_end_date, now)}</dd>
                </div>
                <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-amber-100">
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
                    <ReceiptText className="size-4 text-amber-700" aria-hidden="true" />
                    Tiền cọc phải đóng
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-ink">{depositLabel(post.deposit_months)}</dd>
                  <dd className="text-sm text-muted">
                    {post.deposit > 0 ? `Tương đương ${formatVND(post.deposit)}` : "Chủ nhà không yêu cầu cọc"}
                  </dd>
                </div>
              </dl>
            </section>

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

            {post.amenities.length > 0 ? (
              <section aria-labelledby="amenities-heading">
                <h2 id="amenities-heading" className="text-lg font-bold text-ink">
                  Nội thất và tiện nghi
                </h2>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {post.amenities.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-ink">
                      <Check className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="desc-heading">
              <h2 id="desc-heading" className="text-lg font-bold text-ink">
                Mô tả chi tiết
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">{post.description}</p>
            </section>

            <p className="flex items-center gap-1.5 text-sm text-stone-400">
              <CalendarClock className="size-4" aria-hidden="true" />
              Cập nhật lần cuối: {formatDateTime(post.updated_at)}
            </p>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
              <h2 className="text-base font-bold text-ink">{isSlot ? "Liên hệ nhận slot" : "Liên hệ nhận phòng"}</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <ContractBadge date={post.contract_end_date} now={now} withDate={false} />
                <DepositBadge months={post.deposit_months} />
                {isSlot ? <SlotBadge count={post.slot_count} /> : null}
                {isSlot ? <RoomGenderBadge gender={post.room_gender} /> : null}
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Người liên hệ</dt>
                  <User className="size-4 text-brand-600" aria-hidden="true" />
                  <dd className="font-medium text-ink">{post.contact_name}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Số điện thoại</dt>
                  <Phone className="size-4 text-brand-600" aria-hidden="true" />
                  <dd className="font-medium text-ink">{formatPhone(post.contact_phone)}</dd>
                </div>
              </dl>
              <ContactButtons
                phone={post.contact_phone}
                zalo={post.contact_zalo}
                disabled={done}
                disabledText={isSlot ? "Slot đã pass xong, tạm ngừng nhận liên hệ." : "Phòng đã pass xong, tạm ngừng nhận liên hệ."}
                className="mt-4"
              />
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Tin do người thuê tự đăng, chúng tôi không thẩm định được tính chính xác. Vui lòng xem phòng tận nơi và
                đọc kỹ hợp đồng trước khi đặt cọc.
              </p>
              <ReportLink subject={post.title} className="mt-3 border-t border-stone-200 pt-3" />
            </div>
          </aside>
        </div>
      </main>
      <MobileContactBar
        phone={post.contact_phone}
        zalo={post.contact_zalo}
        disabled={done}
        disabledText={isSlot ? "Slot đã pass xong, tạm ngừng nhận liên hệ." : "Phòng đã pass xong, tạm ngừng nhận liên hệ."}
      />
    </>
  );
}
