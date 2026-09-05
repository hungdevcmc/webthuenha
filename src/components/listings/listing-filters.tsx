"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/form-fields";
import { DEFAULT_FILTER, type ListingFilter } from "@/lib/listings/types";
import { cn } from "@/lib/cn";

type Props = {
  filter: ListingFilter;
  districts: string[];
  onChange: (next: ListingFilter) => void;
  resultCount: number;
  /** Hiện thêm ô lọc theo giới tính người ở ghép (tab "Tìm bạn ở ghép") */
  showGender?: boolean;
};

export function ListingFilters({ filter, districts, onChange, resultCount, showGender }: Props) {
  const isDefault = JSON.stringify(filter) === JSON.stringify(DEFAULT_FILTER);
  const set = <K extends keyof ListingFilter>(key: K, value: ListingFilter[K]) => onChange({ ...filter, [key]: value });

  return (
    <section aria-label="Bộ lọc" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal className="size-4 text-brand-600" aria-hidden="true" />
          Lọc nhanh
        </h2>
        <p className="text-sm text-muted" aria-live="polite">
          {resultCount} kết quả
        </p>
      </div>
      <div className={cn("grid grid-cols-2 gap-3", showGender ? "md:grid-cols-3 lg:grid-cols-5" : "md:grid-cols-4")}>
        <div>
          <label htmlFor="f-status" className="mb-1 block text-xs font-medium text-muted">
            Trạng thái
          </label>
          <Select id="f-status" value={filter.status} onChange={(e) => set("status", e.target.value as ListingFilter["status"])}>
            <option value="all">Tất cả</option>
            <option value="available">Còn trống</option>
            <option value="rented">Đã cho thuê</option>
          </Select>
        </div>
        <div>
          <label htmlFor="f-price" className="mb-1 block text-xs font-medium text-muted">
            Khoảng giá
          </label>
          <Select id="f-price" value={filter.price} onChange={(e) => set("price", e.target.value as ListingFilter["price"])}>
            <option value="all">Mọi mức giá</option>
            <option value="under3">Dưới 3 triệu</option>
            <option value="3to5">3 – 5 triệu</option>
            <option value="5to8">5 – 8 triệu</option>
            <option value="over8">Trên 8 triệu</option>
          </Select>
        </div>
        <div>
          <label htmlFor="f-bedrooms" className="mb-1 block text-xs font-medium text-muted">
            Phòng ngủ
          </label>
          <Select id="f-bedrooms" value={filter.bedrooms} onChange={(e) => set("bedrooms", e.target.value as ListingFilter["bedrooms"])}>
            <option value="all">Bất kỳ</option>
            <option value="1">1 phòng ngủ</option>
            <option value="2">2 phòng ngủ</option>
            <option value="3plus">3 phòng ngủ trở lên</option>
          </Select>
        </div>
        <div>
          <label htmlFor="f-district" className="mb-1 block text-xs font-medium text-muted">
            Khu vực
          </label>
          <Select id="f-district" value={filter.district} onChange={(e) => set("district", e.target.value)}>
            <option value="all">Tất cả khu vực</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
        {showGender ? (
          <div>
            <label htmlFor="f-gender" className="mb-1 block text-xs font-medium text-muted">
              Bạn ở ghép
            </label>
            <Select id="f-gender" value={filter.gender} onChange={(e) => set("gender", e.target.value as ListingFilter["gender"])}>
              <option value="all">Nam hoặc nữ</option>
              <option value="male">Có bạn nam</option>
              <option value="female">Có bạn nữ</option>
            </Select>
          </div>
        ) : null}
      </div>
      {!isDefault ? (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTER)}
          className="mt-3 inline-flex items-center gap-1 rounded-lg text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          <X className="size-4" aria-hidden="true" />
          Xóa bộ lọc
        </button>
      ) : null}
    </section>
  );
}
