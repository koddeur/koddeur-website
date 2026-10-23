import { createHash } from "node:crypto";
import { getSupabaseClient } from "@/lib/supabase";

// Contact messages sent from the home page laptop, stored in Supabase (table contact_messages).

export type ContactMessage = { id: string; created_at: string; email: string; subject: string; message: string; read: boolean };

const TABLE = "contact_messages";

// Hash the IP with the auth secret so the rate limit works without keeping raw IPs.
export function hashIp(ip: string) {
  return createHash("sha256").update(`${ip}:${process.env.AUTH_SECRET ?? ""}`).digest("hex");
}

export async function countRecentMessages(ipHash: string, sinceMinutes: number): Promise<number> {
  const since = new Date(Date.now() - sinceMinutes * 60_000).toISOString();
  const { count, error } = await getSupabaseClient().from(TABLE).select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
  if (error) throw error;
  return count ?? 0;
}

export async function createMessage(input: { email: string; subject: string; message: string; ipHash: string }) {
  const { error } = await getSupabaseClient().from(TABLE).insert({ email: input.email, subject: input.subject, message: input.message, ip_hash: input.ipHash });
  if (error) throw error;
}

export async function listMessages(): Promise<ContactMessage[]> {
  const { data, error } = await getSupabaseClient().from(TABLE).select("id, created_at, email, subject, message, read").order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  return (data ?? []) as ContactMessage[];
}

export async function setMessageRead(id: string, read: boolean) {
  const { error } = await getSupabaseClient().from(TABLE).update({ read }).eq("id", id);
  if (error) throw error;
}

export async function deleteMessage(id: string) {
  const { error } = await getSupabaseClient().from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
