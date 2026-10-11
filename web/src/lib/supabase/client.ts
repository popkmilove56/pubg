import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://dfjffbzbmkitmnsiifib.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_ntEqcHgqsbxQbg_18j_ztg_IdYZcyfu";

export const supabase = createClient(url, key);
