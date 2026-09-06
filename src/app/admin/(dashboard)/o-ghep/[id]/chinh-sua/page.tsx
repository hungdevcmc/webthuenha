import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminListingById } from "@/lib/listings/queries";
import { formatVND } from "@/lib/format";
import { RoommateForm } from "@/components/admin/roommate-form";

export const metadata: Metadata = { title: "Sửa thông tin ở ghép" };

export default async function EditRoommatePage({ params }: PageProps<"/admin/o-ghep/[id]/chinh-sua">) {
  const { id } = await params;
  const supabase = await createClient();
  const listing = await fetchAdminListingById(supabase, id);
  if (!listing) notFound();

  return (
    <>
      <Link href="/admin/o-ghep" className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-brand-700 hover:text-brand-800">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Danh sách phòng ở ghép
      </Link>
      <div className="mb-6 mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{listing.title}</h1>
          <p className="mt-1 text-sm text-muted">
            Giá cả phòng: {formatVND(listing.price)}/tháng · {listing.address}
          </p>
        </div>
        {listing.is_published ? (
          <Link
            href={`/phong/${listing.slug}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Xem tin trên trang khách
          </Link>
        ) : null}
      </div>
      <RoommateForm listing={listing} />
    </>
  );
}
