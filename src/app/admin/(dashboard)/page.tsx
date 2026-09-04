import { createClient } from "@/lib/supabase/server";
import { fetchAdminListings } from "@/lib/listings/queries";
import { AdminListingTable } from "@/components/admin/listing-table";

export default async function AdminHomePage() {
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
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Tin đăng</h1>
          <p className="mt-1 text-sm text-muted">Quản lý toàn bộ phòng, kể cả tin đang ẩn.</p>
        </div>
      </div>
      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Không tải được danh sách: {error}
        </div>
      ) : (
        <AdminListingTable listings={listings} />
      )}
    </>
  );
}
