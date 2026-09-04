import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

const ADMIN_PREFIX = "/admin";
const LOGIN_PATH = "/admin/login";

/**
 * Làm mới phiên đăng nhập Supabase và bảo vệ các route /admin.
 * Người chưa đăng nhập bị chuyển tới /admin/login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers ?? {}).forEach(([k, v]) =>
          response.headers.set(k, v),
        );
      },
    },
  });

  // Quan trọng: gọi getClaims() ngay để làm mới token trước khi trả về.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith(ADMIN_PREFIX);
  const isLoginPage = pathname === LOGIN_PATH;

  if (isAdminArea && !isLoginPage && !isLoggedIn) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && isLoggedIn) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = ADMIN_PREFIX;
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl);
  }

  if (isAdminArea) {
    response.headers.set("Cache-Control", "private, no-store");
  }

  return response;
}
