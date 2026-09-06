import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/o-ghep`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/pass-phong`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/pass-slot`, changeFrequency: "daily", priority: 0.9 },
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
    // Không có dữ liệu thì bỏ qua phần tin đăng
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("transfer_posts")
      .select("slug, updated_at, kind")
      .eq("is_published", true);
    for (const row of data ?? []) {
      entries.push({
        url: `${base}/${row.kind === "slot" ? "pass-slot" : "pass-phong"}/${row.slug}`,
        lastModified: new Date(row.updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Không có dữ liệu thì chỉ trả về các trang tĩnh
  }
  return entries;
}
