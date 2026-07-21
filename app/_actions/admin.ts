"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * Returns true if the currently authenticated Supabase user has
 * the 'admin' role in the profiles table.
 */
export async function getIsAdmin(): Promise<boolean> {
  await connection();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();



  if (error || !data) return false;
  return data.role === "admin";
}

/**
 * Throws an error if the current user is not an admin.
 * Use this as a guard at the top of any admin-only server action.
 */
export async function checkIsAdmin(): Promise<void> {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized. Only admins can perform this action.");
  }
}
