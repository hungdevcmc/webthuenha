import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminListings } from "@/lib/listings/queries";
import { AdminRoommateTable } from "@/components/admin/roommate-table";

export const metadata: Metadata = { title: "Tìm bạn ở ghép" };

export default async function AdminRoommatePage() {
  const supabase = await createClient();
  let listings: Awaited<ReturnType<typeof fetchAdminListings>> = [];
  let error: string | null = null;
  try {
    listings = await fetchAdminListings(supabase);
  } catch (err) {
    error = err instanceof Error ? err.message : "Không tải được dữ liệu";
  }

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Tìm bạn ở ghép</h1>
        <p className="mt-1 text-sm text-muted">
          Quản lý riêng phần ở ghép của từng phòng: giá một chỗ mỗi tháng, phòng dành cho nam hay nữ, số người đang ở và
          khoảng cách tới trường.
        </p>
      </div>
      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Không tải được danh sách: {error}
        </div>
      ) : (
        <AdminRoommateTable listings={listings} />
      )}
    </>
  );
}
