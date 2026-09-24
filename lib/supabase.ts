import { createClient } from "@supabase/supabase-js";

// Server-only client (service role key must never reach the browser bundle — only used
// from Server Components and Route Handlers). Used for data that must survive
// redeployments, unlike the local filesystem which gets rebuilt from git on every deploy.
let client: ReturnType<typeof createClient<any>> | null = null;

export function getSupabaseClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.");
  client = createClient<any>(url, key, { auth: { persistSession: false } });
  return client;
}
