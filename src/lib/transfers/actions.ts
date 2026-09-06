"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { randomSuffix, slugify } from "@/lib/slug";
import { IMAGE_BUCKET } from "@/lib/listings/types";
import type { ActionResult } from "@/lib/listings/actions";
import {
  transferPostAdminSchema,
  transferPostSchema,
  type TransferAdminFormValues,
  type TransferFormValues,
} from "./schema";

type Client = SupabaseClient<Database>;

class ActionError extends Error {}

/**
 * Chống spam đơn giản cho form công khai:
 * - `website` là ô ẩn, người thật không bao giờ điền
 * - `elapsedMs` là thời gian từ lúc mở form tới lúc gửi
 */
export type SubmitGuard = { website?: string; elapsedMs?: number };

const MIN_FILL_MS = 3_000;

function checkGuard(guard: SubmitGuard | undefined) {
  if (guard?.website && guard.website.trim() !== "") {
    throw new ActionError("Không gửi được tin. Vui lòng thử lại.");
  }
  if (typeof guard?.elapsedMs === "number" && guard.elapsedMs >= 0 && guard.elapsedMs < MIN_FILL_MS) {
    throw new ActionError("Bạn gửi tin quá nhanh. Vui lòng kiểm tra lại thông tin rồi gửi lại.");
  }
}

/** Xác thực phiên đăng nhập và quyền admin ở phía server (ngoài RLS của database) */
async function requireAdmin(): Promise<Client> {
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

function revalidateTransferPaths(slug?: string) {
  revalidatePath("/pass-phong");
  revalidatePath("/admin/pass-phong");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/pass-phong/${slug}`);
}

function toResult(err: unknown): ActionResult<never> {
  if (err instanceof ActionError) return { ok: false, error: err.message };
  console.error(err);
  return { ok: false, error: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại." };
}

function parsePublic(input: unknown): TransferFormValues {
  const parsed = transferPostSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new ActionError(`Dữ liệu không hợp lệ: ${first?.message ?? "vui lòng kiểm tra lại"}`);
  }
  return parsed.data;
}

function parseAdmin(input: unknown): TransferAdminFormValues {
  const parsed = transferPostAdminSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new ActionError(`Dữ liệu không hợp lệ: ${first?.message ?? "vui lòng kiểm tra lại"}`);
  }
  return parsed.data;
}

/** Slug duy nhất, thêm hậu tố ngẫu nhiên nếu đã có tin trùng tiêu đề */
async function uniqueSlug(supabase: Client, title: string): Promise<string> {
  const base = slugify(title) || "tin-pass-phong";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${randomSuffix()}`;
    const { data } = await supabase.from("transfer_posts").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${randomSuffix(6)}`;
}

function postPayload(values: TransferFormValues) {
  return {
    title: values.title,
    address: values.address,
    district: values.district,
    city: values.city,
    price: values.price,
    deposit: values.deposit,
    deposit_months: values.deposit_months,
    contract_end_date: values.contract_end_date,
    electricity_price: values.electricity_price,
    electricity_unit: values.electricity_unit,
    water_price: values.water_price,
    water_unit: values.water_unit,
    service_fee: values.service_fee,
    service_fee_included: values.service_fee_included,
    area_m2: values.area_m2,
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    floor: values.floor,
    total_floors: values.total_floors,
    distance_to_school_km: values.distance_to_school_km,
    kind: values.kind,
    // Chỉ tin pass slot mới có số slot, tin pass cả phòng để trống
    slot_count: values.kind === "slot" ? values.slot_count : null,
    room_gender: values.room_gender,
    people_in_room: values.people_in_room,
    amenities: values.amenities,
    description: values.description,
    contact_name: values.contact_name,
    contact_phone: values.contact_phone,
    contact_zalo: values.contact_zalo,
  };
}

/** Chuẩn hoá danh sách ảnh: đúng một ảnh đại diện, sort_order liên tục */
function normalizeImages(images: TransferFormValues["images"]) {
  if (images.length === 0) return [];
  const coverIndex = Math.max(
    0,
    images.findIndex((i) => i.is_cover),
  );
  return images.map((img, index) => ({ ...img, sort_order: index, is_cover: index === coverIndex }));
}

/**
 * Xóa file trong Storage nhưng chỉ khi không còn dòng ảnh nào trỏ tới,
 * xét cả bảng ảnh tin đăng lẫn bảng ảnh tin pass phòng.
 */
async function removeUnreferencedObjects(supabase: Client, paths: string[]) {
  const unique = [...new Set(paths.filter((p) => typeof p === "string" && p.length > 0 && !p.includes("..")))];
  if (unique.length === 0) return;

  const [transfers, listings] = await Promise.all([
    supabase.from("transfer_post_images").select("storage_path").in("storage_path", unique),
    supabase.from("property_images").select("storage_path").in("storage_path", unique),
  ]);
  if (transfers.error || listings.error) {
    // Không chắc chắn thì giữ file lại. Thà thừa file còn hơn mất ảnh.
    console.error("Không kiểm tra được ảnh còn được dùng hay không");
    return;
  }

  const referenced = new Set([
    ...(transfers.data ?? []).map((r) => r.storage_path),
    ...(listings.data ?? []).map((r) => r.storage_path),
  ]);
  const safeToDelete = unique.filter((p) => !referenced.has(p));
  if (safeToDelete.length === 0) return;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove(safeToDelete);
  if (error) console.error("Không xóa được file trong Storage:", error.message);
}

/** Lưu danh sách ảnh của một tin: thêm ảnh mới, xóa ảnh đã bỏ */
async function saveImages(supabase: Client, postId: string, images: TransferFormValues["images"]) {
  const { data: existing, error: readError } = await supabase
    .from("transfer_post_images")
    .select("id, storage_path")
    .eq("post_id", postId);
  if (readError) throw new ActionError(readError.message);

  const normalized = normalizeImages(images);
  const keepIds = new Set(normalized.map((i) => i.id).filter(Boolean));
  const removed = (existing ?? []).filter((e) => !keepIds.has(e.id));

  if (removed.length > 0) {
    const { error } = await supabase
      .from("transfer_post_images")
      .delete()
      .in(
        "id",
        removed.map((r) => r.id),
      );
    if (error) throw new ActionError(error.message);
    await removeUnreferencedObjects(
      supabase,
      removed.map((r) => r.storage_path),
    );
  }

  if (normalized.length === 0) return;

  // Bỏ cờ ảnh đại diện cũ trước để không vi phạm chỉ mục "một ảnh đại diện"
  if ((existing ?? []).length > 0) {
    const { error } = await supabase
      .from("transfer_post_images")
      .update({ is_cover: false })
      .eq("post_id", postId);
    if (error) throw new ActionError(error.message);
  }

  const rows = normalized.map((img) => ({
    ...(img.id ? { id: img.id } : {}),
    post_id: postId,
    storage_path: img.storage_path,
    url: img.url,
    sort_order: img.sort_order,
    is_cover: img.is_cover,
  }));
  const { error } = await supabase.from("transfer_post_images").upsert(rows, { onConflict: "id" });
  if (error) throw new ActionError(error.message);
}

/**
 * Khách tự đăng tin pass phòng. Không cần đăng nhập.
 * RLS chỉ cho phép THÊM tin công khai; sửa và xóa vẫn dành riêng cho admin.
 */
export async function createTransferPost(
  input: unknown,
  guard?: SubmitGuard,
): Promise<ActionResult<{ slug: string }>> {
  try {
    checkGuard(guard);
    const supabase = await createClient();
    const values = parsePublic(input);
    const slug = await uniqueSlug(supabase, values.title);

    const { data, error } = await supabase
      .from("transfer_posts")
      .insert({ ...postPayload(values), slug, is_published: true, is_transferred: false })
      .select("id, slug")
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Không đăng được tin.");

    await saveImages(supabase, data.id, values.images);
    revalidateTransferPaths(data.slug);
    return { ok: true, data: { slug: data.slug } };
  } catch (err) {
    return toResult(err);
  }
}

/** Admin sửa tin pass phòng của khách */
export async function updateTransferPost(
  id: string,
  input: unknown,
): Promise<ActionResult<{ slug: string }>> {
  try {
    const supabase = await requireAdmin();
    const values = parseAdmin(input);
    const { data, error } = await supabase
      .from("transfer_posts")
      .update({
        ...postPayload(values),
        is_published: values.is_published,
        is_transferred: values.is_transferred,
      })
      .eq("id", id)
      .select("id, slug")
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Không tìm thấy tin cần sửa.");

    await saveImages(supabase, id, values.images);
    revalidateTransferPaths(data.slug);
    return { ok: true, data: { slug: data.slug } };
  } catch (err) {
    return toResult(err);
  }
}

/** Admin xóa tin pass phòng */
export async function deleteTransferPost(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data: images } = await supabase
      .from("transfer_post_images")
      .select("storage_path")
      .eq("post_id", id);
    const { data, error } = await supabase
      .from("transfer_posts")
      .delete()
      .eq("id", id)
      .select("slug")
      .maybeSingle();
    if (error) throw new ActionError(error.message);
    if (!data) throw new ActionError("Tin không tồn tại hoặc đã bị xóa.");
    if (images && images.length > 0) {
      await removeUnreferencedObjects(
        supabase,
        images.map((i) => i.storage_path),
      );
    }
    revalidateTransferPaths(data.slug);
    return { ok: true, data: undefined };
  } catch (err) {
    return toResult(err);
  }
}

async function patchTransfer(id: string, patch: { is_published?: boolean; is_transferred?: boolean }) {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("transfer_posts")
    .update(patch)
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  if (error) throw new ActionError(error.message);
  if (!data) throw new ActionError("Tin không tồn tại.");
  revalidateTransferPaths(data.slug);
}

/** Admin ẩn hoặc hiện tin */
export async function setTransferPublished(id: string, isPublished: boolean): Promise<ActionResult> {
  try {
    await patchTransfer(id, { is_published: isPublished });
    return { ok: true, data: undefined };
  } catch (err) {
    return toResult(err);
  }
}

/** Admin đánh dấu tin đã pass được cho người khác */
export async function setTransferDone(id: string, isTransferred: boolean): Promise<ActionResult> {
  try {
    await patchTransfer(id, { is_transferred: isTransferred });
    return { ok: true, data: undefined };
  } catch (err) {
    return toResult(err);
  }
}
