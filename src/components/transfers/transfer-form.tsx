"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Save, Send, UserRound, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { ELECTRICITY_UNITS, WATER_UNITS } from "@/lib/listings/schema";
import { createTransferPost, updateTransferPost } from "@/lib/transfers/actions";
import { ROOMMATE_GENDERS } from "@/lib/listings/schema";
import {
  DEPOSIT_MONTHS,
  TRANSFER_IMAGE_MAX_COUNT,
  TRANSFER_IMAGE_PREFIX,
  transferPostAdminSchema,
  transferPostSchema,
  type TransferAdminFormInput,
  type TransferAdminFormValues,
  type TransferFormValues,
  type TransferKind,
} from "@/lib/transfers/schema";
import { kindBasePath, roomGenderLabel, type TransferWithImages } from "@/lib/transfers/types";
import { formatVND } from "@/lib/format";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { Button } from "@/components/ui/button";
import { Checkbox, FieldError, Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { AmenitiesField } from "@/components/admin/amenities-field";
import { ImageUploader } from "@/components/admin/image-uploader";

type Props =
  | { mode: "create"; kind?: TransferKind }
  | { mode: "edit"; post: TransferWithImages };

/** Ngày hôm nay dạng YYYY-MM-DD, dùng làm giá trị nhỏ nhất cho ô chọn ngày */
function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Gửi tin mới của khách. Đặt ngoài component để phần đọc DOM và đồng hồ
 * không nằm trong phạm vi render của React.
 */
async function submitNewPost(values: TransferFormValues, formEl: HTMLFormElement | null | undefined) {
  const honeypot = formEl?.elements.namedItem("website");
  const website = honeypot instanceof HTMLInputElement ? honeypot.value : "";
  const openedAt = Number(formEl?.dataset.openedAt ?? 0);
  const elapsedMs = openedAt > 0 ? Date.now() - openedAt : -1;
  return createTransferPost(values, { website, elapsedMs });
}

function defaultValues(props: Props): TransferAdminFormInput {
  if (props.mode === "edit") {
    const p = props.post;
    return {
      title: p.title,
      address: p.address,
      district: p.district,
      city: p.city,
      price: p.price,
      deposit: p.deposit,
      deposit_months: p.deposit_months,
      contract_end_date: p.contract_end_date,
      electricity_price: p.electricity_price,
      electricity_unit: p.electricity_unit,
      water_price: p.water_price,
      water_unit: p.water_unit,
      service_fee: p.service_fee,
      service_fee_included: p.service_fee_included,
      area_m2: Number(p.area_m2),
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      floor: p.floor,
      total_floors: p.total_floors,
      distance_to_school_km: p.distance_to_school_km === null ? null : Number(p.distance_to_school_km),
      kind: p.kind,
      slot_count: p.slot_count,
      room_gender: p.room_gender,
      people_in_room: p.people_in_room,
      amenities: p.amenities,
      description: p.description,
      contact_name: p.contact_name,
      contact_phone: p.contact_phone,
      contact_zalo: p.contact_zalo,
      is_published: p.is_published,
      is_transferred: p.is_transferred,
      images: p.images.map((img) => ({
        id: img.id,
        storage_path: img.storage_path,
        url: img.url,
        sort_order: img.sort_order,
        is_cover: img.is_cover,
      })),
    };
  }
  return {
    title: "",
    address: "",
    district: "",
    city: siteConfig.defaultCity,
    price: undefined as unknown as number,
    deposit: undefined as unknown as number,
    deposit_months: 1,
    contract_end_date: "",
    electricity_price: 3500,
    electricity_unit: ELECTRICITY_UNITS[0],
    water_price: 20000,
    water_unit: WATER_UNITS[0],
    service_fee: 0,
    service_fee_included: false,
    area_m2: undefined as unknown as number,
    bedrooms: 1,
    bathrooms: 1,
    floor: null,
    total_floors: null,
    distance_to_school_km: null,
    kind: props.kind ?? "room",
    slot_count: props.kind === "slot" ? 1 : null,
    room_gender: "any",
    people_in_room: 0,
    amenities: [],
    description: "",
    contact_name: "",
    contact_phone: "",
    contact_zalo: "",
    is_published: true,
    is_transferred: false,
    images: [],
  };
}

const toNumber = (v: unknown) => (v === "" || v === null || v === undefined ? undefined : Number(v));
const toNullableNumber = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));

export function TransferForm(props: Props) {
  const router = useRouter();
  const isAdmin = props.mode === "edit";
  const kind: TransferKind = props.mode === "edit" ? props.post.kind : (props.kind ?? "room");
  const isSlot = kind === "slot";
  const [saved, setSaved] = useState(false);
  // Mốc mở form, dùng để chặn bot gửi ngay lập tức. Tính một lần khi khởi tạo.
  const [openedAt] = useState(() => Date.now());

  const form = useForm<TransferAdminFormInput, unknown, TransferAdminFormValues>({
    // Khách đăng tin không được tự đặt trạng thái nên dùng schema riêng
    resolver: zodResolver(isAdmin ? transferPostAdminSchema : transferPostSchema) as never,
    defaultValues: defaultValues(props),
    mode: "onTouched",
  });
  const { register, handleSubmit, control, formState, setValue } = form;
  const { errors, isSubmitting, isDirty } = formState;

  useUnsavedChangesWarning(isDirty && !saved && !isSubmitting);

  const price = useWatch({ control, name: "price" });
  const depositMonths = useWatch({ control, name: "deposit_months" });
  const serviceIncluded = useWatch({ control, name: "service_fee_included" });

  // Gợi ý số tiền cọc = giá thuê × số tháng cọc
  const suggestedDeposit = useMemo(() => {
    const p = Number(price);
    const m = Number(depositMonths);
    if (!Number.isFinite(p) || p <= 0 || !Number.isFinite(m)) return null;
    return p * m;
  }, [price, depositMonths]);

  const onSubmit = handleSubmit(
    async (values, event) => {
      const result = isAdmin
        ? await updateTransferPost((props as { post: TransferWithImages }).post.id, values)
        : await submitNewPost(values, event?.target as HTMLFormElement | undefined);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSaved(true);
      if (isAdmin) {
        toast.success("Đã lưu thay đổi");
        form.reset(values);
        router.refresh();
      } else {
        toast.success(isSlot ? "Đã đăng tin pass slot" : "Đã đăng tin pass phòng");
        router.push(`${kindBasePath(kind)}/${result.data.slug}`);
      }
    },
    () => {
      toast.error("Vui lòng kiểm tra lại các trường được đánh dấu đỏ.");
    },
  );

  const err = (name: keyof TransferAdminFormInput) => errors[name]?.message as string | undefined;
  const numberField = (name: keyof TransferAdminFormInput, nullable = false) =>
    register(name, { setValueAs: nullable ? toNullableNumber : toNumber });

  return (
    <form onSubmit={onSubmit} noValidate data-opened-at={openedAt} className="space-y-8 pb-28">
      {/* Ô ẩn chống bot: người dùng thật không nhìn thấy và không bao giờ điền */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] size-0 opacity-0"
      />

      {isSlot ? (
        <Section
          title="Slot bạn muốn pass"
          description="Cho người xem biết họ sẽ nhận mấy chỗ và ở cùng những ai trong phòng."
          highlight
        >
          <Field label="Số slot muốn pass lại" id="slot_count" required error={err("slot_count")}>
            <div className="relative">
              <Users
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-600"
                aria-hidden="true"
              />
              <Input
                id="slot_count"
                type="number"
                inputMode="numeric"
                min={1}
                max={10}
                className="pl-9"
                {...numberField("slot_count", true)}
                invalid={!!errors.slot_count}
                placeholder="1"
              />
            </div>
          </Field>
          <Field
            label="Số người đang ở trong phòng"
            id="people_in_room"
            error={err("people_in_room")}
            hint="không tính bạn"
          >
            <Input
              id="people_in_room"
              type="number"
              inputMode="numeric"
              min={0}
              max={20}
              {...numberField("people_in_room")}
              invalid={!!errors.people_in_room}
            />
          </Field>
          <Field label="Phòng dành cho" id="room_gender" error={err("room_gender")} className="sm:col-span-2">
            <div className="relative">
              <UserRound
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-600"
                aria-hidden="true"
              />
              <Select id="room_gender" className="pl-9" {...register("room_gender")} invalid={!!errors.room_gender}>
                {ROOMMATE_GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {roomGenderLabel(g)}
                  </option>
                ))}
              </Select>
            </div>
          </Field>
        </Section>
      ) : null}

      <Section
        title="Điều kiện pass lại"
        description="Hai thông tin quan trọng nhất với người muốn nhận phòng. Vui lòng ghi thật chính xác."
        highlight
      >
        <Field
          label="Hợp đồng hết hạn ngày"
          id="contract_end_date"
          required
          error={err("contract_end_date")}
          hint="ngày kết thúc hợp đồng bạn đang thuê"
        >
          <div className="relative">
            <CalendarClock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-600"
              aria-hidden="true"
            />
            <Input
              id="contract_end_date"
              type="date"
              min={todayISO()}
              className="pl-9"
              {...register("contract_end_date")}
              invalid={!!errors.contract_end_date}
            />
          </div>
        </Field>

        <div>
          <p className="mb-1.5 block text-sm font-semibold text-ink" id="deposit-months-label">
            Người nhận phải đóng cọc
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          </p>
          <Controller
            control={control}
            name="deposit_months"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="deposit-months-label">
                {DEPOSIT_MONTHS.map((m) => (
                  <label
                    key={m}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand-400 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-800"
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={m}
                      checked={Number(field.value) === m}
                      onChange={() => field.onChange(m)}
                      onBlur={field.onBlur}
                      className="size-4 accent-brand-600"
                    />
                    <Wallet className="size-4 text-brand-600" aria-hidden="true" />
                    Cọc {m} tháng
                  </label>
                ))}
              </div>
            )}
          />
          <FieldError id="deposit_months-error" message={err("deposit_months")} />
        </div>
      </Section>

      <Section title="Thông tin chung" description="Tiêu đề ngắn gọn, địa chỉ đầy đủ để người xem dễ tìm.">
        <Field label="Tiêu đề" id="title" required error={err("title")} className="sm:col-span-2">
          <Input
            id="title"
            {...register("title")}
            invalid={!!errors.title}
            placeholder={
              isSlot
                ? "Ví dụ: Pass lại 1 slot phòng nữ, tòa S2.03 Ocean Park"
                : "Ví dụ: Pass lại phòng 25 m² có gác, gần Đại học VinUni"
            }
          />
        </Field>
        <Field label="Địa chỉ đầy đủ" id="address" required error={err("address")} className="sm:col-span-2">
          <Input id="address" {...register("address")} invalid={!!errors.address} placeholder="Số nhà, đường, phường, quận" />
        </Field>
        <Field label="Khu vực (quận/huyện)" id="district" required error={err("district")} hint="dùng cho bộ lọc">
          <Input id="district" {...register("district")} invalid={!!errors.district} placeholder="Quận Gia Lâm" />
        </Field>
        <Field label="Tỉnh / thành phố" id="city" required error={err("city")}>
          <Input id="city" {...register("city")} invalid={!!errors.city} />
        </Field>
      </Section>

      <Section title="Giá và chi phí" description="Ghi đúng số tiền (VND). Ví dụ 3500000 cho 3,5 triệu.">
        <Field
          label={isSlot ? "Giá một slot / tháng" : "Giá thuê / tháng"}
          id="price"
          required
          error={err("price")}
          hint={typeof price === "number" && !Number.isNaN(price) ? `= ${formatVND(price)}` : undefined}
        >
          <Input
            id="price"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            {...numberField("price")}
            invalid={!!errors.price}
            placeholder="3500000"
          />
        </Field>
        <Field label="Số tiền cọc" id="deposit" required error={err("deposit")}>
          <Input
            id="deposit"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            {...numberField("deposit")}
            invalid={!!errors.deposit}
          />
          {suggestedDeposit !== null ? (
            <button
              type="button"
              onClick={() => setValue("deposit", suggestedDeposit, { shouldDirty: true, shouldValidate: true })}
              className="mt-1.5 rounded-lg text-left text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Điền {formatVND(suggestedDeposit)} (cọc {depositMonths} tháng)
            </button>
          ) : null}
        </Field>
        <Field label="Giá điện" id="electricity_price" required error={err("electricity_price")}>
          <div className="flex gap-2">
            <Input
              id="electricity_price"
              className="min-w-0 flex-1"
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              {...numberField("electricity_price")}
              invalid={!!errors.electricity_price}
            />
            <Select aria-label="Đơn vị tính điện" {...register("electricity_unit")} className="w-32 shrink-0">
              {ELECTRICITY_UNITS.map((u) => (
                <option key={u} value={u}>
                  /{u}
                </option>
              ))}
            </Select>
          </div>
        </Field>
        <Field label="Giá nước" id="water_price" required error={err("water_price")}>
          <div className="flex gap-2">
            <Input
              id="water_price"
              className="min-w-0 flex-1"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              {...numberField("water_price")}
              invalid={!!errors.water_price}
            />
            <Select aria-label="Đơn vị tính nước" {...register("water_unit")} className="w-32 shrink-0">
              {WATER_UNITS.map((u) => (
                <option key={u} value={u}>
                  /{u}
                </option>
              ))}
            </Select>
          </div>
        </Field>
        <Field label="Phí dịch vụ / tháng" id="service_fee" required error={err("service_fee")} hint="rác, wifi, thang máy…">
          <Input
            id="service_fee"
            type="number"
            inputMode="numeric"
            min={0}
            step={10000}
            {...numberField("service_fee")}
            invalid={!!errors.service_fee}
          />
        </Field>
        <div className="flex items-end">
          <Checkbox
            id="service_fee_included"
            label="Phí dịch vụ đã gồm trong giá thuê"
            description={serviceIncluded ? "Người nhận không phải trả thêm" : "Người nhận trả thêm ngoài giá thuê"}
            {...register("service_fee_included")}
          />
        </div>
      </Section>

      <Section title="Thông số phòng">
        <Field label="Diện tích (m²)" id="area_m2" required error={err("area_m2")}>
          <Input
            id="area_m2"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            {...numberField("area_m2")}
            invalid={!!errors.area_m2}
            placeholder="25"
          />
        </Field>
        <Field label="Số phòng ngủ" id="bedrooms" required error={err("bedrooms")}>
          <Input id="bedrooms" type="number" inputMode="numeric" min={0} {...numberField("bedrooms")} invalid={!!errors.bedrooms} />
        </Field>
        <Field label="Số nhà vệ sinh" id="bathrooms" required error={err("bathrooms")}>
          <Input id="bathrooms" type="number" inputMode="numeric" min={0} {...numberField("bathrooms")} invalid={!!errors.bathrooms} />
        </Field>
        <Field label="Tầng của phòng" id="floor" error={err("floor")} hint="bỏ trống nếu không có">
          <Input id="floor" type="number" inputMode="numeric" min={0} {...numberField("floor", true)} invalid={!!errors.floor} />
        </Field>
        <Field label="Tổng số tầng của tòa nhà" id="total_floors" error={err("total_floors")}>
          <Input
            id="total_floors"
            type="number"
            inputMode="numeric"
            min={0}
            {...numberField("total_floors", true)}
            invalid={!!errors.total_floors}
          />
        </Field>
        <Field
          label={`Khoảng cách tới ${siteConfig.school.name} (km)`}
          id="distance_to_school_km"
          error={err("distance_to_school_km")}
          hint="bỏ trống nếu chưa đo"
        >
          <Input
            id="distance_to_school_km"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            {...numberField("distance_to_school_km", true)}
            invalid={!!errors.distance_to_school_km}
            placeholder="1.5"
          />
        </Field>
      </Section>

      <Section title="Nội thất và tiện nghi" single>
        <Controller
          control={control}
          name="amenities"
          render={({ field }) => <AmenitiesField value={field.value} onChange={field.onChange} />}
        />
        <FieldError id="amenities-error" message={err("amenities")} />
      </Section>

      <Section title="Mô tả chi tiết" single>
        <Label htmlFor="description" required>
          Mô tả
        </Label>
        <Textarea
          id="description"
          rows={7}
          {...register("description")}
          invalid={!!errors.description}
          placeholder="Lý do pass lại, tình trạng phòng, nội thất để lại, thời điểm bàn giao, điều kiện của chủ nhà…"
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        <FieldError id="description-error" message={err("description")} />
      </Section>

      <Section title="Ảnh phòng" description="Ảnh thật giúp tin của bạn được liên hệ nhanh hơn nhiều." single>
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
              maxCount={TRANSFER_IMAGE_MAX_COUNT}
              storagePrefix={TRANSFER_IMAGE_PREFIX}
              canDeleteFiles={isAdmin}
            />
          )}
        />
        <FieldError id="images-error" message={err("images")} />
      </Section>

      <Section title="Liên hệ" description="Người muốn nhận phòng sẽ gọi hoặc nhắn Zalo theo thông tin này.">
        <Field label="Tên người liên hệ" id="contact_name" required error={err("contact_name")}>
          <Input id="contact_name" {...register("contact_name")} invalid={!!errors.contact_name} placeholder="Ví dụ: Chị Lan" />
        </Field>
        <Field label="Số điện thoại" id="contact_phone" required error={err("contact_phone")}>
          <Input
            id="contact_phone"
            type="tel"
            inputMode="tel"
            {...register("contact_phone")}
            invalid={!!errors.contact_phone}
            placeholder="0901234567"
          />
        </Field>
        <Field label="Zalo" id="contact_zalo" error={err("contact_zalo")} hint="không bắt buộc" className="sm:col-span-2">
          <Input
            id="contact_zalo"
            {...register("contact_zalo", { setValueAs: (v) => (typeof v === "string" ? v : "") })}
            invalid={!!errors.contact_zalo}
            placeholder="0901234567 hoặc link zalo.me"
          />
        </Field>
      </Section>

      {isAdmin ? (
        <Section title="Trạng thái" description="Chỉ quản trị viên thấy phần này.">
          <Checkbox
            id="is_transferred"
            label="Đã pass xong"
            description="Đánh dấu khi phòng đã có người nhận"
            {...register("is_transferred")}
          />
          <Checkbox
            id="is_published"
            label="Đang hiển thị công khai"
            description="Bỏ chọn để ẩn tin khỏi trang khách xem"
            {...register("is_published")}
          />
        </Section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-1 sm:px-3">
          <p className="hidden text-sm text-muted sm:block" aria-live="polite">
            {isDirty && !saved ? "Có thay đổi chưa lưu" : "Không có thay đổi"}
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none"
              onClick={() =>
                router.push(
                  isAdmin
                    ? kind === "slot"
                      ? "/admin/pass-slot"
                      : "/admin/pass-phong"
                    : kindBasePath(kind),
                )
              }
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1 sm:flex-none" size="md" disabled={isSubmitting}>
              {isAdmin ? <Save className="size-4" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
              {isSubmitting ? "Đang gửi…" : isAdmin ? "Lưu thay đổi" : "Đăng tin"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  single,
  highlight,
  children,
}: {
  title: string;
  description?: string;
  single?: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        highlight
          ? "rounded-2xl border-2 border-brand-300 bg-brand-50/50 p-4 shadow-card sm:p-6"
          : "rounded-2xl border border-stone-200 bg-white p-4 shadow-card sm:p-6"
      }
      aria-labelledby={`sec-${title}`}
    >
      <h2 id={`sec-${title}`} className="text-lg font-bold text-ink">
        {title}
      </h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className={single ? "mt-4" : "mt-4 grid gap-4 sm:grid-cols-2"}>{children}</div>
    </section>
  );
}

function Field({
  label,
  id,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} required={required} hint={hint}>
        {label}
      </Label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
