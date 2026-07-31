"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * Returns true if the currently authenticated Supabase user has
 * the 'admin' role in the profiles table.
 */
export async function getIsAdmin(): Promise<boolean> {
  try {
    await connection();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("[getIsAdmin] Auth check failed or no user:", authError?.message || "No user session found in cookies.");
      return false;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.log("[getIsAdmin] Profile role fetch error for user", user.id, error?.message);
      return false;
    }

    console.log("[getIsAdmin] User:", user.id, "Role:", data.role);
    return data.role === "admin";
  } catch (err: any) {
    if (
      err?.digest === "DYNAMIC_SERVER_USAGE" ||
      err?.message?.includes("DYNAMIC_SERVER_USAGE") ||
      err?.description?.includes("DYNAMIC_SERVER_USAGE")
    ) {
      throw err;
    }
    console.error("getIsAdmin error:", err);
    return false;
  }
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
