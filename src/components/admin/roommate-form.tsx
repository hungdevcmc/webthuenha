"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { updateRoommateInfo } from "@/lib/listings/actions";
import { ROOMMATE_GENDERS, roommateSchema, type RoommateFormInput, type RoommateFormValues } from "@/lib/listings/schema";
import { genderLabel, type ListingWithImages } from "@/lib/listings/types";
import { formatVND } from "@/lib/format";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { Button } from "@/components/ui/button";
import { Checkbox, FieldError, Input, Label, Select, Textarea } from "@/components/ui/form-fields";

const toNumber = (v: unknown) => (v === "" || v === null || v === undefined ? undefined : Number(v));
const toNullableNumber = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));

/**
 * Form gọn chỉ gồm các thông tin ở ghép của một phòng.
 * Muốn sửa giá phòng, ảnh hay mô tả thì dùng form đầy đủ ở mục Tin đăng.
 */
export function RoommateForm({ listing }: { listing: ListingWithImages }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const form = useForm<RoommateFormInput, unknown, RoommateFormValues>({
    resolver: zodResolver(roommateSchema),
    defaultValues: {
      roommate_open: listing.roommate_open,
      roommate_slot_price: listing.roommate_slot_price,
      roommate_gender: listing.roommate_gender,
      roommate_male_count: listing.roommate_male_count,
      roommate_female_count: listing.roommate_female_count,
      roommate_note: listing.roommate_note,
      distance_to_school_km:
        listing.distance_to_school_km === null ? null : Number(listing.distance_to_school_km),
    },
    mode: "onTouched",
  });
  const { register, handleSubmit, control, formState } = form;
  const { errors, isSubmitting, isDirty } = formState;

  useUnsavedChangesWarning(isDirty && !saved && !isSubmitting);

  const open = useWatch({ control, name: "roommate_open" });
  const slotPrice = useWatch({ control, name: "roommate_slot_price" });

  const onSubmit = handleSubmit(
    async (values) => {
      const result = await updateRoommateInfo(listing.id, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSaved(true);
      toast.success("Đã lưu thông tin ở ghép");
      form.reset(values);
      router.refresh();
    },
    () => {
      toast.error("Vui lòng kiểm tra lại các trường được đánh dấu đỏ.");
    },
  );

  const err = (name: keyof RoommateFormInput) => errors[name]?.message as string | undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-card sm:p-6">
        <Checkbox
          id="roommate_open"
          label="Phòng này đang tìm bạn ở ghép"
          description="Bật để tin xuất hiện ở tab “Tìm bạn ở ghép” trên trang khách"
          {...register("roommate_open")}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="roommate_slot_price" required hint="giá hiện thay cho giá cả phòng">
              Giá một chỗ ở ghép / tháng
            </Label>
            <Input
              id="roommate_slot_price"
              type="number"
              inputMode="numeric"
              min={0}
              step={100000}
              {...register("roommate_slot_price", { setValueAs: toNumber })}
              invalid={!!errors.roommate_slot_price}
              disabled={!open}
              placeholder="2500000"
            />
            <p className="mt-1.5 text-sm text-muted">
              {typeof slotPrice === "number" && slotPrice > 0
                ? `= ${formatVND(slotPrice)}/chỗ/tháng`
                : `Giá cả phòng hiện tại: ${formatVND(listing.price)}/tháng`}
            </p>
            <FieldError id="roommate_slot_price-error" message={err("roommate_slot_price")} />
          </div>

          <div>
            <Label htmlFor="roommate_gender" required>
              Phòng dành cho
            </Label>
            <Select
              id="roommate_gender"
              {...register("roommate_gender")}
              invalid={!!errors.roommate_gender}
              disabled={!open}
            >
              {ROOMMATE_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {genderLabel(g)}
                </option>
              ))}
            </Select>
            <FieldError id="roommate_gender-error" message={err("roommate_gender")} />
          </div>

          <div>
            <Label htmlFor="roommate_male_count">Số bạn nam đang ở</Label>
            <Input
              id="roommate_male_count"
              type="number"
              inputMode="numeric"
              min={0}
              max={20}
              {...register("roommate_male_count", { setValueAs: toNumber })}
              invalid={!!errors.roommate_male_count}
              disabled={!open}
            />
            <FieldError id="roommate_male_count-error" message={err("roommate_male_count")} />
          </div>

          <div>
            <Label htmlFor="roommate_female_count">Số bạn nữ đang ở</Label>
            <Input
              id="roommate_female_count"
              type="number"
              inputMode="numeric"
              min={0}
              max={20}
              {...register("roommate_female_count", { setValueAs: toNumber })}
              invalid={!!errors.roommate_female_count}
              disabled={!open}
            />
            <FieldError id="roommate_female_count-error" message={err("roommate_female_count")} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="distance_to_school_km" hint="bỏ trống nếu chưa đo">
              {`Khoảng cách tới ${siteConfig.school.name} (km)`}
            </Label>
            <Input
              id="distance_to_school_km"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              {...register("distance_to_school_km", { setValueAs: toNullableNumber })}
              invalid={!!errors.distance_to_school_km}
              placeholder="1.5"
            />
            <FieldError id="distance_to_school_km-error" message={err("distance_to_school_km")} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="roommate_note" hint="không bắt buộc">
              Ghi chú về việc ở ghép
            </Label>
            <Textarea
              id="roommate_note"
              rows={3}
              {...register("roommate_note")}
              invalid={!!errors.roommate_note}
              disabled={!open}
              placeholder="Ví dụ: Ưu tiên bạn nữ đi làm giờ hành chính, không nuôi thú cưng."
            />
            <FieldError id="roommate_note-error" message={err("roommate_note")} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {isDirty && !saved ? "Có thay đổi chưa lưu" : "Không có thay đổi"}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push("/admin/o-ghep")} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" size="md" disabled={isSubmitting}>
            <Save className="size-4" aria-hidden="true" />
            {isSubmitting ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </form>
  );
}
