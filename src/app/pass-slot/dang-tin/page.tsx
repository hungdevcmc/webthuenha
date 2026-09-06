import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { TransferForm } from "@/components/transfers/transfer-form";

export const metadata: Metadata = {
  title: "Đăng tin pass slot",
  description:
    "Điền thông tin chỗ ở ghép bạn cần nhượng lại: số slot, giá một slot mỗi tháng, hạn hợp đồng, mức cọc và ảnh phòng. Miễn phí, không cần đăng ký.",
  alternates: { canonical: "/pass-slot/dang-tin" },
  robots: { index: false, follow: true },
};

export default function NewSlotTransferPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        <Link
          href="/pass-slot"
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Quay lại danh sách
        </Link>

        <header className="mb-6 mt-4">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Đăng tin pass slot phòng</h1>
          <p className="mt-2 text-muted">
            Dành cho bạn đang ở ghép và muốn nhượng lại chỗ của mình trong phòng. Tin hiển thị ngay sau khi gửi.
          </p>
        </header>

        <div className="mb-6 flex gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-sm text-ink">
          <Info className="mt-0.5 size-5 shrink-0 text-sky-700" aria-hidden="true" />
          <div>
            <p className="font-semibold">Trước khi đăng, bạn nên biết</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-muted">
              <li>Số điện thoại bạn nhập sẽ hiển thị công khai để người xem liên hệ.</li>
              <li>Nên hỏi ý các bạn đang ở cùng phòng trước khi tìm người thay chỗ của bạn.</li>
              <li>Ghi rõ giờ giấc sinh hoạt của phòng để tìm được người phù hợp.</li>
              <li>Cần sửa hoặc gỡ tin sau khi đăng, gọi {siteConfig.contact.phone} để quản trị viên hỗ trợ.</li>
            </ul>
          </div>
        </div>

        <TransferForm mode="create" kind="slot" />
      </main>
      <SiteFooter />
    </>
  );
}
