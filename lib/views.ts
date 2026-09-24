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

export async function renameViewSlug(oldSlug: string, newSlug: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.from("article_views").update({ slug: newSlug }).eq("slug", oldSlug);
  } catch {
    // Best-effort: the article rename itself must not fail just because the view
    // history couldn't be carried over (e.g. newSlug already has an orphaned row).
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
