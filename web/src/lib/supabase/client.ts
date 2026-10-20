import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://wpjctaksuseilbykjzsc.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_SyE9TtslyUBMtp4NBPxm_g_9OelAXlk";

export const supabase = createClient(url, key);
