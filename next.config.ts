import type { NextConfig } from "next";

/**
 * Cho phép Next.js tối ưu ảnh lấy từ Supabase Storage.
 * Hostname được suy ra từ NEXT_PUBLIC_SUPABASE_URL nên chạy đúng cả khi
 * dùng Supabase cục bộ (127.0.0.1:54321) lẫn project trên cloud.
 */
function supabaseImagePattern() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return [];
  try {
    const url = new URL(raw);
    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

/** Chỉ khi phát triển với Supabase chạy cục bộ (127.0.0.1) mới cho phép ảnh từ IP nội bộ */
const isLocalSupabase =
  process.env.NODE_ENV !== "production" &&
  /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: isLocalSupabase,
    remotePatterns: [
      ...supabaseImagePattern(),
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
