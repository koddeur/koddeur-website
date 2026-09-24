import { getSupabaseClient } from "@/lib/supabase";

export async function getViewCount(slug: string): Promise<number> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("article_views").select("views").eq("slug", slug).maybeSingle();
    if (error || !data) return 0;
    return (data as { views: number }).views;
  } catch {
    return 0;
  }
}

export async function incrementViewCount(slug: string): Promise<number> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc("increment_article_views", { article_slug: slug });
    if (error || typeof data !== "number") return getViewCount(slug);
    return data;
  } catch {
    return 0;
  }
}
