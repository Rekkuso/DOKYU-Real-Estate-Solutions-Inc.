"use server";

import { supabaseAdmin as supabase } from "@/utils/supabase/admin";

/**
 * Upload multiple images to Supabase Storage and return their public URLs.
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `listings/${fileName}`;

    const { error } = await supabase.storage
      .from("listing-images")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  });

  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
}
