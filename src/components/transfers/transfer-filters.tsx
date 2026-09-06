"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/form-fields";
import { DEFAULT_TRANSFER_FILTER, type TransferFilter } from "@/lib/transfers/types";

type Props = {
  filter: TransferFilter;
  districts: string[];
  onChange: (next: TransferFilter) => void;
  resultCount: number;
};

export function TransferFilters({ filter, districts, onChange, resultCount }: Props) {
  const isDefault = JSON.stringify(filter) === JSON.stringify(DEFAULT_TRANSFER_FILTER);
  const set = <K extends keyof TransferFilter>(key: K, value: TransferFilter[K]) =>
    onChange({ ...filter, [key]: value });

  return (
    <section aria-label="Bộ lọc tin pass phòng" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal className="size-4 text-brand-600" aria-hidden="true" />
          Lọc nhanh
        </h2>
        <p className="text-sm text-muted" aria-live="polite">
          {resultCount} kết quả
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <div>
          <label htmlFor="t-status" className="mb-1 block text-xs font-medium text-muted">
            Trạng thái
          </label>
          <Select
            id="t-status"
            value={filter.status}
            onChange={(e) => set("status", e.target.value as TransferFilter["status"])}
          >
            <option value="open">Đang cần pass</option>
            <option value="done">Đã pass xong</option>
            <option value="all">Tất cả</option>
          </Select>
        </div>
        <div>
          <label htmlFor="t-price" className="mb-1 block text-xs font-medium text-muted">
            Khoảng giá
          </label>
          <Select
            id="t-price"
            value={filter.price}
            onChange={(e) => set("price", e.target.value as TransferFilter["price"])}
          >
            <option value="all">Mọi mức giá</option>
            <option value="under3">Dưới 3 triệu</option>
            <option value="3to5">3 – 5 triệu</option>
            <option value="5to8">5 – 8 triệu</option>
            <option value="over8">Trên 8 triệu</option>
          </Select>
        </div>
        <div>
          <label htmlFor="t-deposit" className="mb-1 block text-xs font-medium text-muted">
            Mức cọc
          </label>
          <Select
            id="t-deposit"
            value={filter.deposit}
            onChange={(e) => set("deposit", e.target.value as TransferFilter["deposit"])}
          >
            <option value="all">Cọc bất kỳ</option>
            <option value="1">Cọc 1 tháng</option>
            <option value="3">Cọc 3 tháng</option>
          </Select>
        </div>
        <div>
          <label htmlFor="t-contract" className="mb-1 block text-xs font-medium text-muted">
            Hạn hợp đồng
          </label>
          <Select
            id="t-contract"
            value={filter.contract}
            onChange={(e) => set("contract", e.target.value as TransferFilter["contract"])}
          >
            <option value="all">Bất kỳ</option>
            <option value="under1">Còn dưới 1 tháng</option>
            <option value="1to3">Còn 1 – 3 tháng</option>
            <option value="over3">Còn trên 3 tháng</option>
          </Select>
        </div>
        <div>
          <label htmlFor="t-district" className="mb-1 block text-xs font-medium text-muted">
            Khu vực
          </label>
          <Select id="t-district" value={filter.district} onChange={(e) => set("district", e.target.value)}>
            <option value="all">Tất cả khu vực</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {!isDefault ? (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_TRANSFER_FILTER)}
          className="mt-3 inline-flex items-center gap-1 rounded-lg text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          <X className="size-4" aria-hidden="true" />
          Xóa bộ lọc
        </button>
      ) : null}
    </section>
  );
}
