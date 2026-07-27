"use server";

import { checkIsAdmin } from "../admin";
import { unstable_cache } from "next/cache";
import { supabaseAdmin as supabase } from "@/utils/supabase/admin";
import type { Listing, ListingFilters, ListingSearchResult } from "../../_types/listing";

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
 * Fetch a single active listing by ID for public view.
 * Returns null if not found or if the listing is a draft.
 */
export async function getPublicListingById(
  id: number,
): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("listing")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    price: Number(data.price),
    images: Array.isArray(data.images) ? data.images : [],
    facilities: Array.isArray(data.facilities) ? data.facilities : [],
  } as Listing;
}

/**
 * Fetch similar active listings (same type, excluding the given id).
 * Used for the "You May Also Like" section on the property detail page.
 */
export async function getSimilarListings(
  currentId: number,
  type: string,
  limit = 3,
): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listing")
    .select(
      "id, title, location, address, description, price, beds, baths, area, type, tag, facilities, images, date, updated_at, active",
    )
    .eq("active", true)
    .eq("type", type)
    .neq("id", currentId)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching similar listings:", error);
    return [];
  }

  return (data || []).map((d) => ({
    ...d,
    price: Number(d.price),
    images: Array.isArray(d.images) ? d.images : [],
    facilities: Array.isArray(d.facilities) ? d.facilities : [],
  })) as Listing[];
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

  try {
    // Start building the query — request exact count alongside data
    let query = supabase
      .from("listing")
      .select(
        "id, title, location, address, description, price, beds, baths, area, type, tag, facilities, images, date, updated_at, active",
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
      console.error("Error searching listings:", error.message);
      return {
        listings: [],
        totalCount: 0,
        page,
        perPage,
        totalPages: 0,
      };
    }

    const totalCount = count ?? 0;

    return {
      listings: (data || []).map((d: any) => ({
        ...d,
        price: Number(d.price),
        images: Array.isArray(d.images) ? d.images : [],
        facilities: Array.isArray(d.facilities) ? d.facilities : [],
      })) as Listing[],
      totalCount,
      page,
      perPage,
      totalPages: Math.ceil(totalCount / perPage) || 1,
    };
  } catch (err) {
    console.error("searchListings exception:", err);
    return {
      listings: [],
      totalCount: 0,
      page,
      perPage,
      totalPages: 0,
    };
  }
}

const getCachedFeaturedListings = unstable_cache(
  async (limit: number) => {
    const { data, error } = await supabase
      .from("listing")
      .select("id, title, location, address, description, price, beds, baths, area, type, tag, facilities, images, date, updated_at, active")
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
    facilities: Array.isArray(d.facilities) ? d.facilities : [],
  })) as Listing[];
}
