"use server";

import { supabaseAdmin as supabase } from "@/utils/supabase/admin";

/**
 * Upload multiple images to Supabase Storage and return their public URLs.
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  // Ensure the listing-images bucket exists and is public
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === "listing-images")) {
      await supabase.storage.createBucket("listing-images", { public: true });
    }
  } catch (bucketErr) {
    console.error("Error checking/creating listing-images bucket:", bucketErr);
  }

  const uploadPromises = files.map(async (file) => {
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `listings/${fileName}`;

      // Convert File to Buffer for reliable serverless Node.js runtime upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error } = await supabase.storage
        .from("listing-images")
        .upload(filePath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.error("Error uploading image to Supabase Storage:", error);
        throw new Error(`Supabase Storage upload failed: ${error.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err: any) {
      console.error("Failed to process image file upload:", err);
      throw new Error(`Failed to upload image ${file.name}: ${err.message || err}`);
    }
  });

  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
}
