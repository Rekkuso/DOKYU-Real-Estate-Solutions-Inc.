"use server";

import { createClient } from "@supabase/supabase-js";
import { checkIsAdmin } from "./admin";
import { unstable_cache } from "next/cache";

import { supabaseAdmin as supabase } from "@/utils/supabase/admin";

/**
 * Upload multiple images to Supabase Storage and return their public URLs.
 */
async function uploadImages(files: File[]): Promise<string[]> {
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
    active: true,
  };
}

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
    throw new Error("Failed to add listing to database.");
  }

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
    throw new Error("Failed to update listing.");
  }

  return { success: true };
}

export async function deleteListing(id: number) {
  await checkIsAdmin();



  const { error } = await supabase.from("listing").delete().eq("id", id);

  if (error) {
    console.error("Error deleting listing:", error);
    throw new Error("Failed to delete listing.");
  }

  return { success: true };
}

export async function getListingById(id: number) {


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

/* ───────────────────────────────────────────────────────────
 * Centralized listing queries — search, filter & pagination
 * ─────────────────────────────────────────────────────────── */

export interface Listing {
  id: number;
  title: string;
  location: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  area: string;
  type: string;
  tag: string;
  images: string[];
  date: string;
  updated_at?: string;
  active: boolean;
}

export interface ListingFilters {
  /** Text search — matched against title and location (case-insensitive) */
  query?: string;
  /** Property type filter, e.g. "Houses", "Condos" */
  type?: string;
  /** Minimum price (inclusive) */
  priceMin?: number;
  /** Maximum price (exclusive) */
  priceMax?: number;
  /** Bedroom filter — exact match, or "5+" for 5 and above */
  beds?: string;
  /** Sort order */
  sortBy?: "newest" | "price-asc" | "price-desc";
  /** 1-indexed page number (default 1) */
  page?: number;
  /** Results per page (default 9) */
  perPage?: number;
}

export interface ListingSearchResult {
  listings: Listing[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Server-side search, filter, sort & paginate active listings.
 * Pushes all query work to Supabase/Postgres instead of the browser.
 */
export async function searchListings(
  filters: ListingFilters = {},
): Promise<ListingSearchResult> {


  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.max(1, Math.min(50, filters.perPage ?? 9));
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Start building the query — request exact count alongside data
  let query = supabase
    .from("listing")
    .select(
      "id, title, location, address, price, beds, baths, area, type, tag, images, date, updated_at, active",
      { count: "exact" },
    )
    .eq("active", true);

  // ── Text search (title OR location) ──
  if (filters.query?.trim()) {
    const q = `%${filters.query.trim()}%`;
    query = query.or(`title.ilike.${q},location.ilike.${q}`);
  }

  // ── Type filter ──
  if (filters.type && filters.type !== "All") {
    query = query.eq("type", filters.type);
  }

  // ── Price range ──
  if (filters.priceMin !== undefined && filters.priceMin > 0) {
    query = query.gte("price", filters.priceMin);
  }
  if (filters.priceMax !== undefined && filters.priceMax < Infinity) {
    query = query.lt("price", filters.priceMax);
  }

  // ── Bedrooms ──
  if (filters.beds && filters.beds !== "Any") {
    if (filters.beds === "5+") {
      query = query.gte("beds", 5);
    } else {
      query = query.eq("beds", parseInt(filters.beds, 10));
    }
  }

  // ── Sorting ──
  const sortBy = filters.sortBy ?? "newest";
  if (sortBy === "newest") {
    query = query.order("date", { ascending: false });
  } else if (sortBy === "price-asc") {
    query = query.order("price", { ascending: true });
  } else {
    query = query.order("price", { ascending: false });
  }

  // ── Pagination ──
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error searching listings:", error);
    throw new Error("Failed to search listings.");
  }

  const totalCount = count ?? 0;

  return {
    listings: (data || []).map((d) => ({
      ...d,
      price: Number(d.price),
      images: Array.isArray(d.images) ? d.images : [],
    })) as Listing[],
    totalCount,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(totalCount / perPage)),
  };
}

const getCachedFeaturedListings = unstable_cache(
  async (limit: number) => {
    const { data, error } = await supabase
      .from("listing")
      .select("id, title, location, address, price, beds, baths, area, type, tag, images, date, updated_at, active")
      .eq("active", true)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured listings:", error);
      throw new Error("Failed to fetch featured listings.");
    }

    return data;
  },
  ["featured-listings"],
  { revalidate: 60 }
);

/**
 * Fetch the latest active listings for the homepage featured section.
 */
export async function getFeaturedListings(limit = 6): Promise<Listing[]> {
  const data = await getCachedFeaturedListings(limit);

  return (data || []).map((d) => ({
    ...d,
    price: Number(d.price),
    images: Array.isArray(d.images) ? d.images : [],
  })) as Listing[];
}
