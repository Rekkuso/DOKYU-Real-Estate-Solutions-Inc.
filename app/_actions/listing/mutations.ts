"use server";

import { checkIsAdmin } from "../admin";
import { supabaseAdmin as supabase } from "@/utils/supabase/admin";
import { uploadImages } from "./storage";
import { extractListingData, revalidateAllListingPaths } from "./helpers";

export async function addListing(formData: FormData) {
  await checkIsAdmin();

  const listingData = extractListingData(formData);

  // Upload images
  const imageFiles = formData.getAll("images") as File[];
  const validFiles = imageFiles.filter(
    (f) => f instanceof File && f.size > 0,
  );
  const imageUrls = await uploadImages(validFiles);

  const { error } = await supabase.from("listing").insert([
    {
      ...listingData,
      images: imageUrls,
      date: new Date().toISOString().split("T")[0],
    },
  ]);

  if (error) {
    console.error("Error adding listing:", error);
    throw new Error(`Failed to add listing: ${error.message}`);
  }

  revalidateAllListingPaths();
  return { success: true };
}

export async function updateListing(id: number, formData: FormData) {
  await checkIsAdmin();

  const listingData = extractListingData(formData);

  // Upload new images (if any)
  const imageFiles = formData.getAll("images") as File[];
  const validFiles = imageFiles.filter(
    (f) => f instanceof File && f.size > 0,
  );
  const newImageUrls = await uploadImages(validFiles);

  // Get existing images that were kept (passed as JSON string)
  const existingImagesRaw = formData.get("existingImages") as string;
  let existingImages: string[] = [];
  try {
    existingImages = existingImagesRaw ? JSON.parse(existingImagesRaw) : [];
  } catch {
    existingImages = [];
  }

  const allImages = [...existingImages, ...newImageUrls];

  // NOTE: We do NOT overwrite `date` here. The original publish date is preserved
  // so that edited listings maintain their position in "newest" sort order.
  const { error } = await supabase
    .from("listing")
    .update({
      ...listingData,
      images: allImages,
      updated_at: new Date().toISOString().split("T")[0],
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating listing:", error);
    throw new Error(`Failed to update listing: ${error.message}`);
  }

  revalidateAllListingPaths(id);
  return { success: true };
}

export async function deleteListing(id: number) {
  await checkIsAdmin();

  const { error } = await supabase.from("listing").delete().eq("id", id);

  if (error) {
    console.error("Error deleting listing:", error);
    throw new Error(`Failed to delete listing: ${error.message}`);
  }

  revalidateAllListingPaths(id);
  return { success: true };
}

/**
 * Save a listing as a draft (active = false).
 * Admin-only.
 */
export async function saveDraft(formData: FormData) {
  await checkIsAdmin();

  const listingData = extractListingData(formData);

  // Upload images
  const imageFiles = formData.getAll("images") as File[];
  const validFiles = imageFiles.filter(
    (f) => f instanceof File && f.size > 0,
  );
  const imageUrls = await uploadImages(validFiles);

  const { error } = await supabase.from("listing").insert([
    {
      ...listingData,
      images: imageUrls,
      date: new Date().toISOString().split("T")[0],
      active: false,
    },
  ]);

  if (error) {
    console.error("Error saving draft:", error);
    throw new Error(`Failed to save draft: ${error.message}`);
  }

  revalidateAllListingPaths();
  return { success: true };
}

/**
 * Publish a draft listing by setting active = true.
 * Admin-only.
 */
export async function publishListing(id: number) {
  await checkIsAdmin();

  const { error } = await supabase
    .from("listing")
    .update({ active: true })
    .eq("id", id);

  if (error) {
    console.error("Error publishing listing:", error);
    throw new Error(`Failed to publish listing: ${error.message}`);
  }

  revalidateAllListingPaths(id);
  return { success: true };
}
