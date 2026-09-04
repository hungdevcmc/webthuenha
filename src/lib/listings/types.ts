import type { PropertyImageRow, PropertyRow } from "@/lib/supabase/database.types";

export type Listing = PropertyRow;
export type ListingImage = PropertyImageRow;

/** Tin đăng kèm danh sách ảnh đã sắp xếp */
export type ListingWithImages = Listing & { images: ListingImage[] };

/** Bộ lọc ở trang công khai */
export type ListingFilter = {
  status: "all" | "available" | "rented";
  price: "all" | "under3" | "3to5" | "5to8" | "over8";
  bedrooms: "all" | "1" | "2" | "3plus";
  district: string; // "all" hoặc tên khu vực
};

export const DEFAULT_FILTER: ListingFilter = {
  status: "all",
  price: "all",
  bedrooms: "all",
  district: "all",
};

/** Tên bucket Storage chứa ảnh tin đăng */
export const IMAGE_BUCKET = "property-images";

/** Tên kênh realtime công khai dùng để đồng bộ tin đăng */
export const REALTIME_TOPIC = "listings";
export const REALTIME_EVENT = "change";

/** Payload do trigger trong database gửi qua Realtime broadcast */
export type ListingChangePayload = {
  table: "properties" | "property_images";
  op: "INSERT" | "UPDATE" | "DELETE";
  id: string;
};

/** Lấy ảnh đại diện (ảnh có is_cover, nếu không thì ảnh đầu tiên) */
export function coverImage(listing: ListingWithImages): ListingImage | null {
  return listing.images.find((i) => i.is_cover) ?? listing.images[0] ?? null;
}

/** Sắp xếp ảnh: ảnh đại diện lên đầu, sau đó theo sort_order */
export function sortImages(images: ListingImage[]): ListingImage[] {
  return [...images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
}

/** Áp dụng bộ lọc lên danh sách tin */
export function applyFilter(listings: ListingWithImages[], f: ListingFilter): ListingWithImages[] {
  return listings.filter((l) => {
    if (f.status === "available" && !l.is_available) return false;
    if (f.status === "rented" && l.is_available) return false;
    if (f.district !== "all" && l.district !== f.district) return false;
    if (f.bedrooms === "1" && l.bedrooms !== 1) return false;
    if (f.bedrooms === "2" && l.bedrooms !== 2) return false;
    if (f.bedrooms === "3plus" && l.bedrooms < 3) return false;
    const p = l.price;
    if (f.price === "under3" && p >= 3_000_000) return false;
    if (f.price === "3to5" && (p < 3_000_000 || p >= 5_000_000)) return false;
    if (f.price === "5to8" && (p < 5_000_000 || p >= 8_000_000)) return false;
    if (f.price === "over8" && p < 8_000_000) return false;
    return true;
  });
}

/** Sắp xếp: còn trống lên trước, sau đó theo thời gian cập nhật mới nhất */
export function sortListings(listings: ListingWithImages[]): ListingWithImages[] {
  return [...listings].sort((a, b) => {
    if (a.is_available !== b.is_available) return a.is_available ? -1 : 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}
