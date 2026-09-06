import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { sortTransferImages, sortTransferPosts, type TransferWithImages } from "./types";

type Client = SupabaseClient<Database>;

const TRANSFER_SELECT = "*, images:transfer_post_images(*)";

function normalize(row: TransferWithImages): TransferWithImages {
  return { ...row, images: sortTransferImages(row.images ?? []) };
}

/**
 * Danh sách tin pass phòng đang công khai.
 * RLS đảm bảo người dùng ẩn danh chỉ thấy tin is_published.
 */
export async function fetchPublicTransfers(supabase: Client): Promise<TransferWithImages[]> {
  const { data, error } = await supabase
    .from("transfer_posts")
    .select(TRANSFER_SELECT)
    .eq("is_published", true)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return sortTransferPosts((data as TransferWithImages[]).map(normalize));
}

/** Một tin pass phòng công khai theo slug (null nếu không có hoặc đã ẩn) */
export async function fetchPublicTransferBySlug(
  supabase: Client,
  slug: string,
): Promise<TransferWithImages | null> {
  const { data, error } = await supabase
    .from("transfer_posts")
    .select(TRANSFER_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalize(data as TransferWithImages) : null;
}

/** Toàn bộ tin pass phòng, kể cả tin đã ẩn – chỉ admin nhận được dữ liệu nhờ RLS */
export async function fetchAdminTransfers(supabase: Client): Promise<TransferWithImages[]> {
  const { data, error } = await supabase
    .from("transfer_posts")
    .select(TRANSFER_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as TransferWithImages[]).map(normalize);
}

/** Một tin pass phòng theo id (admin) */
export async function fetchAdminTransferById(
  supabase: Client,
  id: string,
): Promise<TransferWithImages | null> {
  const { data, error } = await supabase
    .from("transfer_posts")
    .select(TRANSFER_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalize(data as TransferWithImages) : null;
}
