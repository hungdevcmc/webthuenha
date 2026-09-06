import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminTransferById } from "@/lib/transfers/queries";
import { formatDateTime } from "@/lib/format";
import { TransferForm } from "@/components/transfers/transfer-form";

export const metadata: Metadata = { title: "Sửa tin pass slot" };

export default async function EditSlotTransferPage({ params }: PageProps<"/admin/pass-slot/[id]/chinh-sua">) {
  const { id } = await params;
  const supabase = await createClient();
  const post = await fetchAdminTransferById(supabase, id);
  if (!post) notFound();

  return (
    <>
      <Link
        href="/admin/pass-slot"
        className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Danh sách tin pass slot
      </Link>
      <div className="mb-6 mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Sửa tin pass slot</h1>
          <p className="mt-1 text-sm text-muted">Cập nhật lần cuối: {formatDateTime(post.updated_at)}</p>
        </div>
        {post.is_published ? (
          <Link
            href={`/pass-slot/${post.slug}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Xem tin trên trang khách
          </Link>
        ) : null}
      </div>
      <TransferForm mode="edit" post={post} />
    </>
  );
}
