"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { createListing, updateListing } from "@/lib/listings/actions";
import {
  ELECTRICITY_UNITS,
  ROOMMATE_GENDERS,
  WATER_UNITS,
  listingSchema,
  type ListingFormInput,
  type ListingFormValues,
} from "@/lib/listings/schema";
import type { ListingWithImages } from "@/lib/listings/types";
import { formatVND } from "@/lib/format";
import { genderLabel } from "@/lib/listings/types";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { Button } from "@/components/ui/button";
import { Checkbox, FieldError, Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { AmenitiesField } from "./amenities-field";
import { ImageUploader } from "./image-uploader";

type Props = { mode: "create" } | { mode: "edit"; listing: ListingWithImages };

function defaultValues(props: Props): ListingFormInput {
  if (props.mode === "edit") {
    const l = props.listing;
    return {
      title: l.title,
      address: l.address,
      district: l.district,
      city: l.city,
      price: l.price,
      deposit: l.deposit,
      electricity_price: l.electricity_price,
      electricity_unit: l.electricity_unit,
      water_price: l.water_price,
      water_unit: l.water_unit,
      service_fee: l.service_fee,
      service_fee_included: l.service_fee_included,
      area_m2: Number(l.area_m2),
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms,
      floor: l.floor,
      total_floors: l.total_floors,
      amenities: l.amenities,
      description: l.description,
      contact_name: l.contact_name,
      contact_phone: l.contact_phone,
      contact_zalo: l.contact_zalo,
      is_available: l.is_available,
      is_published: l.is_published,
      roommate_open: l.roommate_open,
      roommate_male_count: l.roommate_male_count,
      roommate_female_count: l.roommate_female_count,
      roommate_note: l.roommate_note,
      roommate_slot_price: l.roommate_slot_price,
      roommate_gender: l.roommate_gender,
      distance_to_school_km: l.distance_to_school_km === null ? null : Number(l.distance_to_school_km),
      images: l.images.map((img) => ({
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
    deposit: 0,
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
    amenities: [],
    description: "",
    contact_name: siteConfig.contact.name,
    contact_phone: siteConfig.contact.phoneRaw,
    contact_zalo: siteConfig.contact.phoneRaw,
    is_available: true,
    is_published: true,
    roommate_open: false,
    roommate_male_count: 0,
    roommate_female_count: 0,
    roommate_note: "",
    roommate_slot_price: 0,
    roommate_gender: "any",
    distance_to_school_km: null,
    images: [],
  };
}

const toNumber = (v: unknown) => (v === "" || v === null || v === undefined ? undefined : Number(v));
const toNullableNumber = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));

export function ListingForm(props: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const form = useForm<ListingFormInput, unknown, ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: defaultValues(props),
    mode: "onTouched",
  });
  const { register, handleSubmit, control, formState } = form;
  const { errors, isSubmitting, isDirty } = formState;

  useUnsavedChangesWarning(isDirty && !saved && !isSubmitting);

  const price = useWatch({ control, name: "price" });
  const deposit = useWatch({ control, name: "deposit" });
  const serviceIncluded = useWatch({ control, name: "service_fee_included" });
  const roommateOpen = useWatch({ control, name: "roommate_open" });

  const onSubmit = handleSubmit(
    async (values) => {
      const result =
        props.mode === "create" ? await createListing(values) : await updateListing(props.listing.id, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSaved(true);
      toast.success(props.mode === "create" ? "Đã đăng tin mới" : "Đã lưu thay đổi");
      if (props.mode === "create") {
        router.push("/admin");
      } else {
        form.reset(values);
        router.refresh();
      }
    },
    () => {
      toast.error("Vui lòng kiểm tra lại các trường được đánh dấu đỏ.");
    },
  );

  const err = (name: keyof ListingFormInput) => errors[name]?.message as string | undefined;
  const numberField = (name: keyof ListingFormInput, nullable = false) =>
    register(name, { setValueAs: nullable ? toNullableNumber : toNumber });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8 pb-28">
      <Section title="Thông tin chung" description="Tiêu đề ngắn gọn, địa chỉ đầy đủ để khách dễ tìm.">
        <Field label="Tiêu đề" id="title" required error={err("title")} className="sm:col-span-2">
          <Input id="title" {...register("title")} invalid={!!errors.title} placeholder="Ví dụ: Căn hộ 2 phòng ngủ tòa S2.03, Vinhomes Ocean Park 1" />
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
          label="Giá thuê / tháng"
          id="price"
          required
          error={err("price")}
          hint={typeof price === "number" && !Number.isNaN(price) ? `= ${formatVND(price)}` : undefined}
        >
          <Input id="price" type="number" inputMode="numeric" min={0} step={1000} {...numberField("price")} invalid={!!errors.price} placeholder="3500000" />
        </Field>
        <Field
          label="Tiền đặt cọc"
          id="deposit"
          required
          error={err("deposit")}
          hint={typeof deposit === "number" && !Number.isNaN(deposit) ? `= ${deposit === 0 ? "không cọc" : formatVND(deposit)}` : undefined}
        >
          <Input id="deposit" type="number" inputMode="numeric" min={0} step={1000} {...numberField("deposit")} invalid={!!errors.deposit} />
        </Field>
        <Field label="Giá điện" id="electricity_price" required error={err("electricity_price")}>
          <div className="flex gap-2">
            <Input id="electricity_price" className="min-w-0 flex-1" type="number" inputMode="numeric" min={0} step={100} {...numberField("electricity_price")} invalid={!!errors.electricity_price} />
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
            <Input id="water_price" className="min-w-0 flex-1" type="number" inputMode="numeric" min={0} step={1000} {...numberField("water_price")} invalid={!!errors.water_price} />
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
          <Input id="service_fee" type="number" inputMode="numeric" min={0} step={10000} {...numberField("service_fee")} invalid={!!errors.service_fee} />
        </Field>
        <div className="flex items-end">
          <Checkbox
            id="service_fee_included"
            label="Phí dịch vụ đã gồm trong giá thuê"
            description={serviceIncluded ? "Khách không phải trả thêm" : "Khách trả thêm ngoài giá thuê"}
            {...register("service_fee_included")}
          />
        </div>
      </Section>

      <Section title="Thông số phòng">
        <Field label="Diện tích (m²)" id="area_m2" required error={err("area_m2")}>
          <Input id="area_m2" type="number" inputMode="decimal" min={0} step={0.5} {...numberField("area_m2")} invalid={!!errors.area_m2} placeholder="25" />
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
          <Input id="total_floors" type="number" inputMode="numeric" min={0} {...numberField("total_floors", true)} invalid={!!errors.total_floors} />
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
        <Controller control={control} name="amenities" render={({ field }) => <AmenitiesField value={field.value} onChange={field.onChange} />} />
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
          placeholder="Mô tả tình trạng phòng, giờ giấc, an ninh, khu vực xung quanh, điều kiện thuê…"
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        <FieldError id="description-error" message={err("description")} />
      </Section>

      <Section title="Ảnh" description="Ảnh đầu tiên hoặc ảnh được đánh dấu sao là ảnh đại diện." single>
        <Controller control={control} name="images" render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} disabled={isSubmitting} />} />
        <FieldError id="images-error" message={err("images")} />
      </Section>

      <Section title="Liên hệ">
        <Field label="Người liên hệ" id="contact_name" required error={err("contact_name")}>
          <Input id="contact_name" {...register("contact_name")} invalid={!!errors.contact_name} />
        </Field>
        <Field label="Số điện thoại" id="contact_phone" required error={err("contact_phone")}>
          <Input id="contact_phone" type="tel" inputMode="tel" {...register("contact_phone")} invalid={!!errors.contact_phone} placeholder="0901234567" />
        </Field>
        <Field label="Zalo" id="contact_zalo" error={err("contact_zalo")} hint="số điện thoại hoặc link zalo.me" className="sm:col-span-2">
          <Input id="contact_zalo" {...register("contact_zalo", { setValueAs: (v) => (typeof v === "string" ? v : "") })} invalid={!!errors.contact_zalo} placeholder="0901234567" />
        </Field>
      </Section>

      <Section
        title="Tìm bạn ở ghép"
        description="Bật mục này để tin xuất hiện ở tab “Tìm bạn ở ghép”. Nhập số người hiện đang sẵn sàng ở ghép trong phòng."
      >
        <div className="sm:col-span-2">
          <Checkbox
            id="roommate_open"
            label="Phòng này đang tìm bạn ở ghép"
            description="Bỏ chọn nếu phòng không cần thêm người ở ghép"
            {...register("roommate_open")}
          />
        </div>
        <Field
          label="Giá một chỗ ở ghép / tháng"
          id="roommate_slot_price"
          error={err("roommate_slot_price")}
          hint="giá hiện ở tab Tìm bạn ở ghép"
        >
          <Input
            id="roommate_slot_price"
            type="number"
            inputMode="numeric"
            min={0}
            step={100000}
            {...numberField("roommate_slot_price")}
            invalid={!!errors.roommate_slot_price}
            disabled={!roommateOpen}
            placeholder="2500000"
          />
        </Field>
        <Field label="Phòng dành cho" id="roommate_gender" error={err("roommate_gender")}>
          <Select id="roommate_gender" {...register("roommate_gender")} invalid={!!errors.roommate_gender} disabled={!roommateOpen}>
            {ROOMMATE_GENDERS.map((g) => (
              <option key={g} value={g}>
                {genderLabel(g)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Số bạn nam sẵn sàng ở ghép" id="roommate_male_count" error={err("roommate_male_count")}>
          <Input
            id="roommate_male_count"
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            {...numberField("roommate_male_count")}
            invalid={!!errors.roommate_male_count}
            disabled={!roommateOpen}
          />
        </Field>
        <Field label="Số bạn nữ sẵn sàng ở ghép" id="roommate_female_count" error={err("roommate_female_count")}>
          <Input
            id="roommate_female_count"
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            {...numberField("roommate_female_count")}
            invalid={!!errors.roommate_female_count}
            disabled={!roommateOpen}
          />
        </Field>
        <Field
          label="Ghi chú về việc ở ghép"
          id="roommate_note"
          error={err("roommate_note")}
          hint="không bắt buộc"
          className="sm:col-span-2"
        >
          <Textarea
            id="roommate_note"
            rows={3}
            {...register("roommate_note")}
            invalid={!!errors.roommate_note}
            disabled={!roommateOpen}
            placeholder="Ví dụ: Ưu tiên bạn nữ đi làm giờ hành chính, không nuôi thú cưng."
          />
        </Field>
      </Section>

      <Section title="Trạng thái">
        <Checkbox id="is_available" label="Còn trống" description="Bỏ chọn nếu phòng đã có người thuê" {...register("is_available")} />
        <Checkbox id="is_published" label="Đang hiển thị công khai" description="Bỏ chọn để ẩn tin khỏi trang khách xem" {...register("is_published")} />
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-1 sm:px-3">
          <p className="hidden text-sm text-muted sm:block" aria-live="polite">
            {isDirty && !saved ? "Có thay đổi chưa lưu" : "Không có thay đổi"}
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => router.push("/admin")} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1 sm:flex-none" size="md" disabled={isSubmitting}>
              <Save className="size-4" aria-hidden="true" />
              {isSubmitting ? "Đang lưu…" : props.mode === "create" ? "Đăng tin" : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Section({ title, description, single, children }: { title: string; description?: string; single?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-card sm:p-6" aria-labelledby={`sec-${title}`}>
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
