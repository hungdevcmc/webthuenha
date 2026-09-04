import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { sortImages, sortListings, type ListingWithImages } from "./types";

type Client = SupabaseClient<Database>;

const LISTING_SELECT = "*, images:property_images(*)";

function normalize(row: ListingWithImages): ListingWithImages {
  return { ...row, images: sortImages(row.images ?? []) };
}

/**
 * Danh sách tin đang công khai. RLS đảm bảo người dùng ẩn danh chỉ thấy tin is_published.
 * Dùng được cả ở server (createClient của server) lẫn trình duyệt (khi realtime báo thay đổi).
 */
export async function fetchPublicListings(supabase: Client): Promise<ListingWithImages[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(LISTING_SELECT)
    .eq("is_published", true)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return sortListings((data as ListingWithImages[]).map(normalize));
}

/** Một tin công khai theo slug (null nếu không có hoặc đã ẩn) */
export async function fetchPublicListingBySlug(
  supabase: Client,
  slug: string,
): Promise<ListingWithImages | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(LISTING_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalize(data as ListingWithImages) : null;
}

/** Toàn bộ tin (kể cả đã ẩn) – chỉ admin mới nhận được dữ liệu nhờ RLS */
export async function fetchAdminListings(supabase: Client): Promise<ListingWithImages[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(LISTING_SELECT)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ListingWithImages[]).map(normalize);
}

/** Một tin theo id (admin) */
export async function fetchAdminListingById(
  supabase: Client,
  id: string,
): Promise<ListingWithImages | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(LISTING_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalize(data as ListingWithImages) : null;
}
