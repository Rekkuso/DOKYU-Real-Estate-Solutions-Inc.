"use server";

import { createClient } from "@supabase/supabase-js";
import { checkIsAdmin } from "./admin";

import { supabaseAdmin as supabase } from "@/utils/supabase/admin";

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  avatar_url: string | null;
  is_banned: boolean;
  created_at: string;
}

/**
 * Fetches all users with their profile data.
 * Admin-only.
 */
export async function getAllUsers(page = 1, perPage = 50): Promise<{ users: UserProfile[], total: number }> {
  await checkIsAdmin();



  // Fetch paginated auth users
  const { data: authData, error: authError } =
    await supabase.auth.admin.listUsers({ page, perPage });

  if (authError) {
    console.error("Error fetching auth users:", authError);
    throw new Error("Failed to fetch users.");
  }

  const userIds = authData.users.map(u => u.id);

  // Fetch profiles for only those users
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, display_name, avatar_url, is_banned, created_at")
    .in("id", userIds);

  if (profileError) {
    console.error("Error fetching profiles:", profileError);
    throw new Error("Failed to fetch profiles.");
  }

  const profileMap = new Map(
    (profiles || []).map((p: any) => [p.id, p])
  );

  const mappedUsers = (authData.users || []).map((authUser) => {
    const profile = profileMap.get(authUser.id) as any;
    return {
      id: authUser.id,
      email: authUser.email || "No email",
      role: profile?.role || "user",
      display_name: profile?.display_name || null,
      avatar_url: profile?.avatar_url || null,
      is_banned: profile?.is_banned || false,
      created_at: profile?.created_at || authUser.created_at,
    };
  });

  return {
    users: mappedUsers,
    total: (authData as any).aud ? (authData as any).total || mappedUsers.length : mappedUsers.length
  };
}

/**
 * Ban a user by setting is_banned = true.
 * Admin-only.
 */
export async function banUser(userId: string) {
  await checkIsAdmin();



  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: true })
    .eq("id", userId);

  if (error) {
    console.error("Error banning user:", error);
    throw new Error("Failed to ban user.");
  }

  return { success: true };
}

/**
 * Unban a user by setting is_banned = false.
 * Admin-only.
 */
export async function unbanUser(userId: string) {
  await checkIsAdmin();



  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: false })
    .eq("id", userId);

  if (error) {
    console.error("Error unbanning user:", error);
    throw new Error("Failed to unban user.");
  }

  return { success: true };
}

/**
 * Permanently delete a user and their data.
 * Admin-only. Cascades to profile and likes.
 */
export async function deleteUser(userId: string) {
  await checkIsAdmin();



  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user.");
  }

  return { success: true };
}
