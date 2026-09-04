const vnd = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

/** 3500000 -> "3.500.000 ₫" */
export function formatVND(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return vnd.format(value);
}

/** 3500000 -> "3,5 triệu", 900000 -> "900 nghìn" (dùng cho thẻ nhỏ) */
export function formatVNDShort(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    const text = Number.isInteger(m) ? m.toString() : m.toFixed(1).replace(".", ",");
    return `${text} triệu`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)} nghìn`;
  }
  return `${value} ₫`;
}

/** Giá + đơn vị: "3.500 ₫/kWh"; giá 0 -> "Miễn phí" */
export function formatUnitPrice(price: number, unit: string): string {
  if (price === 0) return "Miễn phí";
  return `${formatVND(price)}/${unit}`;
}

/** Diện tích: "25 m²" */
export function formatArea(m2: number): string {
  const text = Number.isInteger(m2) ? m2.toString() : m2.toFixed(1).replace(".", ",");
  return `${text} m²`;
}

const dateFmt = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

/** "3 ngày trước" — truyền `now` để tránh lệch giữa server và client */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return formatDate(iso);
}

/** 0901234567 -> 0901 234 567 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}
