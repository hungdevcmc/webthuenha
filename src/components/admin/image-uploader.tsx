"use client";

import { SafeImage } from "@/components/listings/safe-image";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, validateImageFile } from "@/lib/listings/images-client";
import { deleteStorageObjects } from "@/lib/listings/actions";
import { IMAGE_MAX_COUNT, type ListingImageInput } from "@/lib/listings/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = {
  value: ListingImageInput[];
  onChange: (next: ListingImageInput[]) => void;
  disabled?: boolean;
  /** Số ảnh tối đa cho tin này */
  maxCount?: number;
  /** Thư mục trong Storage, ví dụ "pass" cho ảnh khách tự tải lên */
  storagePrefix?: string;
  /**
   * Có được xóa hẳn file khỏi Storage khi bỏ ảnh chưa lưu hay không.
   * Form công khai đặt false vì khách ẩn danh không có quyền xóa file.
   */
  canDeleteFiles?: boolean;
};

type Uploading = { key: string; name: string; preview: string };

function renumber(list: ListingImageInput[]): ListingImageInput[] {
  const hasCover = list.some((i) => i.is_cover);
  return list.map((img, index) => ({ ...img, sort_order: index, is_cover: hasCover ? img.is_cover : index === 0 }));
}

export function ImageUploader({
  value,
  onChange,
  disabled,
  maxCount = IMAGE_MAX_COUNT,
  storagePrefix,
  canDeleteFiles = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<Uploading[]>([]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const remaining = maxCount - value.length - uploading.length;
    if (list.length > remaining) {
      toast.error(`Chỉ có thể thêm tối đa ${maxCount} ảnh cho mỗi tin.`);
      return;
    }
    const valid: File[] = [];
    for (const file of list) {
      const problem = validateImageFile(file);
      if (problem) toast.error(problem);
      else valid.push(file);
    }
    if (valid.length === 0) return;

    const supabase = createClient();
    const pending = valid.map((file) => ({
      key: `${file.name}-${file.size}-${Math.random()}`,
      name: file.name,
      preview: URL.createObjectURL(file),
    }));
    setUploading((prev) => [...prev, ...pending]);

    let current = value;
    await Promise.all(
      valid.map(async (file, index) => {
        const item = pending[index];
        try {
          const uploaded = await uploadImage(supabase, file, storagePrefix);
          current = renumber([
            ...current,
            { storage_path: uploaded.storage_path, url: uploaded.url, sort_order: current.length, is_cover: false },
          ]);
          onChange(current);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : `Không tải được ảnh ${file.name}`);
        } finally {
          URL.revokeObjectURL(item.preview);
          setUploading((prev) => prev.filter((u) => u.key !== item.key));
        }
      }),
    );
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(renumber(next));
  }

  function setCover(index: number) {
    onChange(renumber(value.map((img, i) => ({ ...img, is_cover: i === index }))));
  }

  async function remove(index: number) {
    const target = value[index];
    const next = renumber(value.filter((_, i) => i !== index));
    onChange(next);
    // Ảnh vừa upload (chưa lưu vào tin) thì xóa luôn khỏi Storage để tránh file rác
    if (!target.id && canDeleteFiles) {
      const result = await deleteStorageObjects([target.storage_path]);
      if (!result.ok) toast.error(result.error);
    }
  }

  return (
    <div>
      <label
        htmlFor="image-input"
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-white px-4 py-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40",
          disabled && "pointer-events-none opacity-60",
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <ImagePlus className="size-8 text-brand-600" aria-hidden="true" />
        <span className="text-sm font-semibold text-ink">Chọn ảnh hoặc kéo thả vào đây</span>
        <span className="text-xs text-muted">JPG, PNG hoặc WebP · tối đa 5 MB/ảnh · tối đa {maxCount} ảnh. Ảnh được nén tự động.</span>
        <input
          ref={inputRef}
          id="image-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          disabled={disabled}
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </label>

      {value.length > 0 || uploading.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-label="Ảnh đã chọn">
          {value.map((img, index) => (
            <li key={img.storage_path} className={cn("overflow-hidden rounded-xl border bg-white", img.is_cover ? "border-brand-500 ring-2 ring-brand-200" : "border-stone-200")}>
              <div className="relative aspect-[4/3] bg-stone-100">
                <SafeImage src={img.url} alt={`Ảnh ${index + 1}`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                {img.is_cover ? (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                    <Star className="size-3" aria-hidden="true" />
                    Ảnh đại diện
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="sm" className="size-8 px-0" onClick={() => move(index, -1)} disabled={disabled || index === 0} aria-label="Chuyển lên trước">
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="sm" className="size-8 px-0" onClick={() => move(index, 1)} disabled={disabled || index === value.length - 1} aria-label="Chuyển ra sau">
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </Button>
                </div>
                <div className="flex gap-0.5">
                  {!img.is_cover ? (
                    <Button variant="ghost" size="sm" className="size-8 px-0" onClick={() => setCover(index)} disabled={disabled} aria-label="Đặt làm ảnh đại diện" title="Đặt làm ảnh đại diện">
                      <Star className="size-4" aria-hidden="true" />
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" className="size-8 px-0 text-red-600 hover:bg-red-50" onClick={() => void remove(index)} disabled={disabled} aria-label="Xóa ảnh" title="Xóa ảnh">
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
          {uploading.map((u) => (
            <li key={u.key} className="overflow-hidden rounded-xl border border-stone-200 bg-white" aria-busy="true">
              <div className="relative aspect-[4/3] bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.preview} alt="" className="h-full w-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                  <Loader2 className="size-6 animate-spin text-brand-600" aria-hidden="true" />
                </div>
              </div>
              <p className="truncate p-2 text-xs text-muted">Đang tải {u.name}…</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
