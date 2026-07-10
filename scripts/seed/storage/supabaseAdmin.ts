import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.seeder" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.warn("⚠️ Warning: Supabase URL or Service Role Key missing in .env.seeder. Storage uploads will fail.");
}

export const supabaseAdmin = createClient(
  supabaseUrl || "https://dummy.supabase.co",
  serviceKey || "dummy-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
