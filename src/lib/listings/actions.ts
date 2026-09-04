"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { randomSuffix, slugify } from "@/lib/slug";
import { listingSchema, type ListingFormValues } from "./schema";
import { IMAGE_BUCKET } from "./types";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

class ActionError extends Error {}

/** Xác thực phiên đăng nhập và quyền admin ở phía server (ngoài RLS của database) */
async function requireAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    throw new ActionError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) {
    throw new ActionError("Tài khoản này không có quyền quản trị.");
  }
  return supabase;
}

function revalidateListingPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/phong/${slug}`);
}

function toResult(err: unknown): ActionResult<never> {
  if (err instanceof ActionError) return { ok: false, error: err.message };
  console.error(err);
  return { ok: false, error: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại." };
}

function parseInput(input: unknown): ListingFormValues {
  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new ActionError(`Dữ liệu không hợp lệ: ${first?.message ?? "vui lòng kiểm tra lại"}`);
  }
  return parsed.data;
}

/**
 * Xóa file trong Storage nhưng CHỈ khi không còn dòng property_images nào trỏ tới.
 * Tránh trường hợp một tin khác (hoặc chính tin này) vẫn đang dùng file đó
 * mà file lại bị xóa mất, để lại ảnh hỏng trên giao diện.
 */
async function removeUnreferencedObjects(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  paths: string[],
) {
  const unique = [...new Set(paths.filter((p) => typeof p === "string" && p.length > 0 && !p.includes("..")))];
  if (unique.length === 0) return;

  const { data: stillUsed, error } = await supabase
    .from("property_images")
    .select("storage_path")
    .in("storage_path", unique);
  if (error) {
    // Không chắc chắn thì giữ file lại. Thà thừa file còn hơn mất ảnh.
    console.error("Không kiểm tra được ảnh còn được dùng hay không:", error.message);
    return;
  }

  const referenced = new Set((stillUsed ?? []).map((r) => r.storage_path));
  const safeToDelete = unique.filter((p) => !referenced.has(p));
  if (safeToDelete.length === 0) return;

  const { error: removeError } = await supabase.storage.from(IMAGE_BUCKET).remove(safeToDelete);
  if (removeError) console.error("Không xóa được file trong Storage:", removeError.message);
}

/** Chuẩn hoá danh sách ảnh: đúng một ảnh đại diện, sort_order liên tục */
function normalizeImages(images: ListingFormValues["images"]) {
  const ordered = [...images].sort((a, b) => a.sort_order - b.sort_order);
  let coverIndex = ordered.findIndex((i) => i.is_cover);
  if (coverIndex < 0) coverIndex = 0;
  return ordered.map((img, index) => ({
    ...img,
    sort_order: index,
    is_cover: index === coverIndex,
  }));
}

function propertyPayload(values: ListingFormValues) {
  const { images: _images, ...rest } = values;
  void _images;
  return rest;
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  title: string,
): Promise<string> {
  const base = slugify(title) || "phong";
  let candidate = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await supabase.from("properties").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${randomSuffix()}`;
  }
  return `${base}-${randomSuffix(8)}`;
}

async function saveImages(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  propertyId: string,
  images: ListingFormValues["images"],
) {
  const { data: existing, error: existingError } = await supabase
    .from("property_images")
    .select("id, storage_path")
    .eq("property_id", propertyId);
  if (existingError) throw new ActionError(existingError.message);

  const normalized = normalizeImages(images);
  const keepIds = new Set(normalized.map((i) => i.id).filter(Boolean));
  const removed = (existing ?? []).filter((e) => !keepIds.has(e.id));

  if (removed.length > 0) {
    const { error: delError } = await supabase
      .from("property_images")
      .delete()
      .in(
        "id",
        removed.map((r) => r.id),
      );
    if (delError) throw new ActionError(delError.message);
    await removeUnreferencedObjects(supabase, removed.map((r) => r.storage_path));
  }

  if (normalized.length === 0) return;

  // Bỏ cờ ảnh đại diện cũ trước để không vi phạm chỉ mục "một ảnh đại diện"
  const { error: resetError } = await supabase
    .from("property_images")
    .update({ is_cover: false })
    .eq("property_id", propertyId);
  if (resetError) throw new ActionError(resetError.message);

  const rows = normalized.map((img) => ({
    ...(img.id ? { id: img.id } : {}),
    property_id: propertyId,
    storage_path: img.storage_path,
    url: img.url,
    sort_order: img.sort_order,
    is_cover: img.is_cover,
  }));
  const { error: upsertError } = await supabase.from("property_images").upsert(rows, { onConflict: "id" });
  if (upsertError) throw new ActionError(upsertError.message);
}

export async function createListing(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const supabase = await requireAdmin();
    const values = parseInput(input);
    const slug = await uniqueSlug(supabase, values.title);
    const { data, error } = await supabase
      .from("properties")
      .insert({ ...propertyPayload(values), slug })
      .select("id, slug")
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Không tạo được tin.");
    await saveImages(supabase, data.id, values.images);
    revalidateListingPaths(data.slug);
    return { ok: true, data: { id: data.id, slug: data.slug } };
  } catch (err) {
    return toResult(err);
  }
}

export async function updateListing(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const supabase = await requireAdmin();
    const values = parseInput(input);
    const { data, error } = await supabase
      .from("properties")
      .update(propertyPayload(values))
      .eq("id", id)
      .select("id, slug")
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Không tìm thấy tin cần sửa.");
    await saveImages(supabase, id, values.images);
    revalidateListingPaths(data.slug);
    return { ok: true, data: { id: data.id, slug: data.slug } };
  } catch (err) {
    return toResult(err);
  }
}

export async function deleteListing(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data: images } = await supabase
      .from("property_images")
      .select("storage_path")
      .eq("property_id", id);
    const { data, error } = await supabase.from("properties").delete().eq("id", id).select("slug").maybeSingle();
    if (error) throw new ActionError(error.message);
    if (!data) throw new ActionError("Tin không tồn tại hoặc đã bị xóa.");
    if (images && images.length > 0) {
      await removeUnreferencedObjects(supabase, images.map((i) => i.storage_path));
    }
    revalidateListingPaths(data.slug);
    return { ok: true, data: undefined };
  } catch (err) {
    return toResult(err);
  }
}

async function patchListing(id: string, patch: { is_available?: boolean; is_published?: boolean }) {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("properties").update(patch).eq("id", id).select("slug").maybeSingle();
  if (error) throw new ActionError(error.message);
  if (!data) throw new ActionError("Tin không tồn tại.");
  revalidateListingPaths(data.slug);
}

export async function setListingAvailability(id: string, isAvailable: boolean): Promise<ActionResult> {
  try {
    await patchListing(id, { is_available: isAvailable });
    return { ok: true, data: undefined };
  } catch (err) {
    return toResult(err);
  }
}

export async function setListingPublished(id: string, isPublished: boolean): Promise<ActionResult> {
  try {
    await patchListing(id, { is_published: isPublished });
    return { ok: true, data: undefined };
  } catch (err) {
    return toResult(err);
  }
}

/**
 * Xóa file trong Storage khi admin bỏ ảnh vừa upload nhưng chưa lưu tin.
 * Chỉ xóa file không còn tin nào tham chiếu, nên dù form giữ trạng thái cũ
 * (ví dụ người dùng bấm Quay lại trình duyệt) thì ảnh của tin đã lưu vẫn an toàn.
 */
export async function deleteStorageObjects(paths: string[]): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    await removeUnreferencedObjects(supabase, paths);
    return { ok: true, data: undefined };
  } catch (err) {
    return toResult(err);
  }
}
