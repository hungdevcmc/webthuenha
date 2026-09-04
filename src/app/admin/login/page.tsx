import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";
import { siteConfig } from "@/config/site";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/admin") ? next : "/admin";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mx-auto flex w-fit items-center gap-2.5 font-bold text-brand-800">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Home className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg">{siteConfig.name}</span>
        </Link>
        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-card">
          <h1 className="text-xl font-bold text-ink">Đăng nhập quản trị</h1>
          <p className="mt-1 text-sm text-muted">Chỉ dành cho chủ nhà / người quản lý tin đăng.</p>
          <LoginForm nextPath={nextPath} />
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          <Link href="/" className="font-medium text-brand-700 hover:underline">
            ← Về trang công khai
          </Link>
        </p>
      </div>
    </main>
  );
}
