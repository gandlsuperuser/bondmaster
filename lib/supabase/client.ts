import { createBrowserClient } from "@supabase/ssr";

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    !!url &&
    !!key &&
    url !== "your_supabase_project_url" &&
    key !== "your_supabase_anon_key" &&
    url.trim() !== "" &&
    key.trim() !== ""
  );
};

export const createClient = () => {
  if (!isSupabaseConfigured()) {
    // Return dummy client if supabase is not configured
    return {} as any;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
