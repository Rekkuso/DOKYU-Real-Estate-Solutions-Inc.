"use server";

import { createClient } from "@supabase/supabase-js";
import { checkIsAdmin } from "./admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, serviceRoleKey);
}

// Generate a random gradient for the mock image if not provided
const gradients = [
  "from-blue-600 to-indigo-600",
  "from-emerald-600 to-teal-600",
  "from-orange-500 to-rose-500",
  "from-purple-600 to-pink-600",
  "from-cyan-600 to-blue-600",
];

function extractListingData(formData: FormData) {
  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw.replace(/,/g, "")) : 0;
  const beds = parseInt(formData.get("beds") as string) || 0;
  const baths = parseInt(formData.get("baths") as string) || 0;

  return {
    title: formData.get("title") as string,
    location: formData.get("location") as string,
    address: formData.get("address") as string,
    price: price,
    beds: beds,
    baths: baths,
    area: formData.get("area") as string,
    type: (formData.get("type") as string) || "Houses",
    tag: (formData.get("tag") as string) || "New",
    gradient: gradients[Math.floor(Math.random() * gradients.length)],
    date: new Date().toISOString().split("T")[0],
    active: true,
  };
}

export async function addListing(formData: FormData) {
  await checkIsAdmin();

  const listingData = extractListingData(formData);
  const supabase = getSupabase();

  const { error } = await supabase.from("listing").insert([listingData]);

  if (error) {
    console.error("Error adding listing:", error);
    throw new Error("Failed to add listing to database.");
  }

  return { success: true };
}

export async function updateListing(id: number, formData: FormData) {
  await checkIsAdmin();

  const listingData = extractListingData(formData);
  const supabase = getSupabase();

  const { error } = await supabase
    .from("listing")
    .update(listingData)
    .eq("id", id);

  if (error) {
    console.error("Error updating listing:", error);
    throw new Error("Failed to update listing.");
  }

  return { success: true };
}

export async function deleteListing(id: number) {
  await checkIsAdmin();

  const supabase = getSupabase();

  const { error } = await supabase.from("listing").delete().eq("id", id);

  if (error) {
    console.error("Error deleting listing:", error);
    throw new Error("Failed to delete listing.");
  }

  return { success: true };
}

export async function getListingById(id: number) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("listing")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error("Listing not found.");
  }

  return data;
}

/**
 * Fetch all draft listings (active = false).
 * Admin-only.
 */
export async function getDraftListings() {
  await checkIsAdmin();

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("listing")
    .select("*")
    .eq("active", false)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching drafts:", error);
    throw new Error("Failed to fetch draft listings.");
  }

  return data || [];
}

/**
 * Save a listing as a draft (active = false).
 * Admin-only.
 */
export async function saveDraft(formData: FormData) {
  await checkIsAdmin();

  const listingData = extractListingData(formData);
  listingData.active = false;
  const supabase = getSupabase();

  const { error } = await supabase.from("listing").insert([listingData]);

  if (error) {
    console.error("Error saving draft:", error);
    throw new Error("Failed to save draft.");
  }

  return { success: true };
}

/**
 * Publish a draft listing by setting active = true.
 * Admin-only.
 */
export async function publishListing(id: number) {
  await checkIsAdmin();

  const supabase = getSupabase();

  const { error } = await supabase
    .from("listing")
    .update({ active: true })
    .eq("id", id);

  if (error) {
    console.error("Error publishing listing:", error);
    throw new Error("Failed to publish listing.");
  }

  return { success: true };
}
