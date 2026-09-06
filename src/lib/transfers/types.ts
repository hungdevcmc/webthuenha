import type { TransferPostImageRow, TransferPostRow } from "@/lib/supabase/database.types";

export type TransferPost = TransferPostRow;
export type TransferImage = TransferPostImageRow;

/** Tin pass phòng kèm danh sách ảnh đã sắp xếp */
export type TransferWithImages = TransferPost & { images: TransferImage[] };

/** Kênh realtime riêng cho tin pass phòng */
export const TRANSFER_REALTIME_TOPIC = "transfers";

/** Payload do trigger trong database gửi qua Realtime broadcast */
export type TransferChangePayload = {
  table: "transfer_posts" | "transfer_post_images";
  op: "INSERT" | "UPDATE" | "DELETE";
  id: string;
};

/** Bộ lọc ở tab "Pass lại phòng" */
export type TransferFilter = {
  status: "all" | "open" | "done";
  price: "all" | "under3" | "3to5" | "5to8" | "over8";
  deposit: "all" | "1" | "3";
  /** Hợp đồng còn hạn trong bao lâu */
  contract: "all" | "under1" | "1to3" | "over3";
  district: string;
};

export const DEFAULT_TRANSFER_FILTER: TransferFilter = {
  status: "open",
  price: "all",
  deposit: "all",
  contract: "all",
  district: "all",
};

/** Nhãn hiển thị cho mức cọc */
export function depositLabel(months: number): string {
  return `Cọc ${months} tháng`;
}

/** Số ngày còn lại của hợp đồng, tính từ mốc `now` */
export function daysUntil(dateISO: string, now: number = Date.now()): number {
  const end = new Date(`${dateISO}T00:00:00`).getTime();
  if (Number.isNaN(end)) return 0;
  const days = Math.ceil((end - now) / 86_400_000);
  // Math.ceil có thể trả về -0 khi hạn rơi đúng hôm nay; chuẩn hoá về 0
  return days === 0 ? 0 : days;
}

/** Mô tả thời hạn hợp đồng còn lại: "còn 2 tháng", "hết hạn hôm nay"… */
export function contractRemainingLabel(dateISO: string, now: number = Date.now()): string {
  const days = daysUntil(dateISO, now);
  if (days < 0) return "Đã hết hạn";
  if (days === 0) return "Hết hạn hôm nay";
  if (days === 1) return "Còn 1 ngày";
  if (days < 30) return `Còn ${days} ngày`;
  const months = Math.round(days / 30);
  if (months < 12) return `Còn khoảng ${months} tháng`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `Còn khoảng ${years} năm` : `Còn khoảng ${years} năm ${rest} tháng`;
}

/** Lấy ảnh đại diện (ảnh có is_cover, nếu không thì ảnh đầu tiên) */
export function transferCover(post: TransferWithImages): TransferImage | null {
  return post.images.find((i) => i.is_cover) ?? post.images[0] ?? null;
}

/** Sắp xếp ảnh: ảnh đại diện lên đầu, sau đó theo sort_order */
export function sortTransferImages(images: TransferImage[]): TransferImage[] {
  return [...images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
}

/** Áp dụng bộ lọc lên danh sách tin pass phòng */
export function applyTransferFilter(
  posts: TransferWithImages[],
  f: TransferFilter,
  now: number = Date.now(),
): TransferWithImages[] {
  return posts.filter((p) => {
    if (f.status === "open" && p.is_transferred) return false;
    if (f.status === "done" && !p.is_transferred) return false;
    if (f.district !== "all" && p.district !== f.district) return false;
    if (f.deposit !== "all" && String(p.deposit_months) !== f.deposit) return false;

    if (f.contract !== "all") {
      const days = daysUntil(p.contract_end_date, now);
      if (f.contract === "under1" && days >= 30) return false;
      if (f.contract === "1to3" && (days < 30 || days >= 90)) return false;
      if (f.contract === "over3" && days < 90) return false;
    }

    const price = p.price;
    if (f.price === "under3" && price >= 3_000_000) return false;
    if (f.price === "3to5" && (price < 3_000_000 || price >= 5_000_000)) return false;
    if (f.price === "5to8" && (price < 5_000_000 || price >= 8_000_000)) return false;
    if (f.price === "over8" && price < 8_000_000) return false;
    return true;
  });
}

/** Sắp xếp: tin chưa pass lên trước, sau đó tới tin sắp hết hạn hợp đồng */
export function sortTransferPosts(posts: TransferWithImages[]): TransferWithImages[] {
  return [...posts].sort((a, b) => {
    if (a.is_transferred !== b.is_transferred) return a.is_transferred ? 1 : -1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}
