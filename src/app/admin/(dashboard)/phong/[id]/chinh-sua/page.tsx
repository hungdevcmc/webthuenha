import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminListingById } from "@/lib/listings/queries";
import { formatDateTime } from "@/lib/format";
import { ListingForm } from "@/components/admin/listing-form";

export const metadata: Metadata = { title: "Chỉnh sửa tin" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditListingPage({ params }: PageProps<"/admin/phong/[id]/chinh-sua">) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();
  const listing = await fetchAdminListingById(supabase, id);
  if (!listing) notFound();

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-brand-700 hover:text-brand-800">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Danh sách tin
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Chỉnh sửa tin</h1>
          <p className="mt-1 text-sm text-muted">
            Cập nhật lần cuối: {formatDateTime(listing.updated_at)} · Đường dẫn: <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">/phong/{listing.slug}</code>
          </p>
        </div>
        {listing.is_published ? (
          <Link
            href={`/phong/${listing.slug}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Xem trang công khai
          </Link>
        ) : null}
      </div>
      <div className="mt-6">
        <ListingForm mode="edit" listing={listing} />
      </div>
    </>
  );
}
