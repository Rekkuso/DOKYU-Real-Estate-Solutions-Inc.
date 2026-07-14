"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Get the current user's profile data.
 */
export async function getProfile() {
  noStore();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, avatar_url, is_banned, created_at, age, phone_number")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return {
    ...data,
    email: user.email || "",
  };
}

/**
 * Update the current user's profile information.
 */
export async function updateProfile(updates: { display_name?: string; age?: number | null; phone_number?: string | null; avatar_url?: string | null }) {
  noStore();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated.");

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile.");
  }

  return { success: true };
}

/**
 * Upload a profile avatar. Accepts FormData with a "file" field.
 * Uploads to Supabase Storage and updates the avatar_url in profiles.
 */
export async function uploadAvatar(formData: FormData) {
  noStore();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated.");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided.");

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPEG, PNG, WebP, or GIF.");
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("File is too large. Maximum size is 2MB.");
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${user.id}/avatar.${ext}`;

  // Use service role to bypass any RLS issues with storage
  const serviceSupabase = createServiceClient(supabaseUrl, serviceRoleKey);

  // Upload to storage (upsert to overwrite existing)
  const { error: uploadError } = await serviceSupabase.storage
    .from("avatars")
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    throw new Error("Failed to upload avatar.");
  }

  // Get public URL
  const { data: urlData } = serviceSupabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  // Update profile with new avatar URL
  const { error: updateError } = await serviceSupabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) {
    console.error("Error updating avatar_url:", updateError);
    throw new Error("Failed to save avatar URL.");
  }

  return { success: true, avatarUrl };
}
