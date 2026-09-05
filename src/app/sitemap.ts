import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/o-ghep`, changeFrequency: "daily", priority: 0.9 },
  ];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("properties").select("slug, updated_at").eq("is_published", true);
    for (const row of data ?? []) {
      entries.push({
        url: `${base}/phong/${row.slug}`,
        lastModified: new Date(row.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // Không có dữ liệu thì chỉ trả về trang chủ
  }
  return entries;
}
