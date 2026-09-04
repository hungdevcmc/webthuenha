import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ListingForm } from "@/components/admin/listing-form";

export const metadata: Metadata = { title: "Đăng tin mới" };

export default function NewListingPage() {
  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-brand-700 hover:text-brand-800">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Danh sách tin
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Đăng tin mới</h1>
      <p className="mt-1 text-sm text-muted">Điền đầy đủ thông tin để khách thuê dễ quyết định. Các trường có dấu * là bắt buộc.</p>
      <div className="mt-6">
        <ListingForm mode="create" />
      </div>
    </>
  );
}
