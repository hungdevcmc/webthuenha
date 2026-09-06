import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchPublicTransferBySlug } from "@/lib/transfers/queries";
import { depositLabel, transferCover } from "@/lib/transfers/types";
import { formatDate, formatVND } from "@/lib/format";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { TransferDetail } from "@/components/transfers/transfer-detail";

type Props = PageProps<"/pass-slot/[slug]">;

async function loadPost(slug: string) {
  const supabase = await createClient();
  return fetchPublicTransferBySlug(supabase, slug, "slot");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug).catch(() => null);
  if (!post) return { title: "Không tìm thấy tin pass slot" };
  const cover = transferCover(post);
  const description = `${formatVND(post.price)}/slot/tháng · ${depositLabel(post.deposit_months)} · hợp đồng hết hạn ${formatDate(`${post.contract_end_date}T00:00:00`)} · ${post.address}`;
  return {
    title: post.title,
    description,
    alternates: { canonical: `/pass-slot/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      images: cover ? [{ url: cover.url, alt: post.title }] : undefined,
    },
  };
}

export default async function TransferDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  // Server Component bất đồng bộ, chỉ chạy một lần mỗi request nên lấy giờ ở đây là an toàn
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <>
      <SiteHeader />
      <TransferDetail post={post} now={now} />
      <SiteFooter />
    </>
  );
}
