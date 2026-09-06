import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminTransfers } from "@/lib/transfers/queries";
import { AdminTransferTable } from "@/components/admin/transfer-table";

export const metadata: Metadata = { title: "Tin pass phòng" };

export default async function AdminTransferPage() {
  const supabase = await createClient();
  let posts: Awaited<ReturnType<typeof fetchAdminTransfers>> = [];
  let error: string | null = null;
  try {
    posts = await fetchAdminTransfers(supabase);
  } catch (err) {
    error = err instanceof Error ? err.message : "Không tải được dữ liệu";
  }

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Tin pass phòng</h1>
        <p className="mt-1 text-sm text-muted">
          Tin do khách tự đăng ở tab “Pass lại phòng”. Bạn có thể sửa nội dung, ẩn hoặc xóa tin.
        </p>
      </div>
      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Không tải được danh sách: {error}
        </div>
      ) : (
        <AdminTransferTable posts={posts} />
      )}
    </>
  );
}
