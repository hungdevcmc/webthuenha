import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client dùng trong Server Components, Server Actions và Route Handlers.
 * Phải tạo mới cho mỗi request.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Được gọi từ Server Component: không thể ghi cookie.
          // Proxy (src/proxy.ts) sẽ đảm nhiệm việc làm mới phiên đăng nhập.
        }
      },
    },
  });
}
