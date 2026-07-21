import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Module-level singleton Supabase client using the service role key.
 * Safe to reuse across requests because it carries no per-user state.
 * The Supabase JS SDK uses REST (PostgREST) under the hood, so there
 * are no persistent Postgres connections to manage.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
