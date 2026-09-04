import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { SignOutButton } from "@/components/admin/sign-out-button";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s | Quản trị" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/admin/login");
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  const email = typeof data.claims.email === "string" ? data.claims.email : "";

  if (!isAdmin) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto size-10 text-amber-600" aria-hidden="true" />
          <h1 className="mt-3 text-lg font-bold text-ink">Tài khoản chưa được cấp quyền quản trị</h1>
          <p className="mt-2 text-sm text-muted">
            Bạn đã đăng nhập bằng <strong>{email}</strong> nhưng tài khoản này không có trong danh sách admin. Xem hướng dẫn
            cấp quyền trong README.
          </p>
          <div className="mt-5 flex justify-center">
            <SignOutButton />
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}
