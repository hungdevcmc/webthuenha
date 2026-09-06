"use client";

import imageCompression from "browser-image-compression";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { IMAGE_ALLOWED_TYPES, IMAGE_MAX_SIZE_BYTES } from "./schema";
import { IMAGE_BUCKET } from "./types";

export type UploadedImage = { storage_path: string; url: string };

/** Kiểm tra định dạng và dung lượng trước khi upload. Trả về thông báo lỗi hoặc null. */
export function validateImageFile(file: File): string | null {
  if (!(IMAGE_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return `"${file.name}": chỉ chấp nhận ảnh JPG, PNG hoặc WebP.`;
  }
  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `"${file.name}": dung lượng ${mb} MB vượt quá 5 MB.`;
  }
  return null;
}

/** Nén và chuyển sang WebP ở phía trình duyệt để tiết kiệm dung lượng Storage */
export async function compressImage(file: File): Promise<Blob> {
  try {
    return await imageCompression(file, {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.82,
    });
  } catch {
    // Nếu không nén được (trình duyệt cũ), dùng file gốc
    return file;
  }
}

function buildStoragePath(prefix?: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const folder = prefix ? `${prefix}/${yyyy}/${mm}` : `${yyyy}/${mm}`;
  return `${folder}/${id}.webp`;
}

/**
 * Upload một ảnh (đã nén) lên Storage, trả về đường dẫn và URL công khai.
 * `prefix` dùng để tách thư mục theo nguồn ảnh, ví dụ "pass" cho ảnh khách tự tải lên.
 */
export async function uploadImage(
  supabase: SupabaseClient<Database>,
  file: File,
  prefix?: string,
): Promise<UploadedImage> {
  const blob = await compressImage(file);
  const contentType = blob.type || "image/webp";
  const basePath = buildStoragePath(prefix);
  const path = contentType === "image/webp" ? basePath : basePath.replace(/\.webp$/, "");
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, blob, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    throw new Error(`Không tải được ảnh "${file.name}": ${error.message}`);
  }
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return { storage_path: path, url: data.publicUrl };
}
