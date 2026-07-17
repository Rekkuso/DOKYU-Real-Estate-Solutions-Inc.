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
  gradient: string;
  date: string;
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
  const supabase = getSupabase();

  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.max(1, Math.min(50, filters.perPage ?? 9));
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Start building the query — request exact count alongside data
  let query = supabase
    .from("listing")
    .select(
      "id, title, location, address, price, beds, baths, area, type, tag, gradient, date, active",
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
    listings: (data || []).map((d) => ({ ...d, price: Number(d.price) })) as Listing[],
    totalCount,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(totalCount / perPage)),
  };
}

/**
 * Fetch the latest active listings for the homepage featured section.
 */
export async function getFeaturedListings(limit = 6): Promise<Listing[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("listing")
    .select("id, title, location, address, price, beds, baths, area, type, tag, gradient, date, active")
    .eq("active", true)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured listings:", error);
    throw new Error("Failed to fetch featured listings.");
  }

  return (data || []).map((d) => ({ ...d, price: Number(d.price) })) as Listing[];
}
