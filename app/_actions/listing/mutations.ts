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
  console.log("==========================================");
  console.log("[updateListing Server Action Invoked] id:", id);
  console.log("==========================================");

  await checkIsAdmin();

  const listingData = extractListingData(formData);

  // Upload new images (if any)
  let newImageUrls: string[] = [];
  const imageFiles = formData.getAll("images") as File[];
  const validFiles = imageFiles.filter(
    (f) => f instanceof File && f.size > 0,
  );
  if (validFiles.length > 0) {
    newImageUrls = await uploadImages(validFiles);
  }

  // Get existing images that were kept (passed as JSON string)
  const existingImagesRaw = formData.get("existingImages") as string;
  let existingImages: string[] = [];
  try {
    existingImages = existingImagesRaw ? JSON.parse(existingImagesRaw) : [];
  } catch {
    existingImages = [];
  }

  const allImages = [...existingImages, ...newImageUrls];

  const updatePayload: Record<string, any> = {
    ...listingData,
    images: allImages,
  };

  const { data: updatedRows, error } = await supabase
    .from("listing")
    .update(updatePayload)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating listing in Supabase:", error);
    throw new Error(`Failed to update listing: ${error.message}`);
  }

  if (!updatedRows || updatedRows.length === 0) {
    console.error("No listing row updated for ID:", id);
    throw new Error(`Failed to update listing: Property #${id} was not found.`);
  }

  revalidateAllListingPaths(id);
  return { success: true, listing: updatedRows[0] };
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
