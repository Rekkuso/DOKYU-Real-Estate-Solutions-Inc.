"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * Toggle a like on a listing for the current user.
 * If already liked, removes the like. Otherwise, adds it.
 */
export async function toggleLike(listingId: number) {
  await connection();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be signed in to like a property.");

  // Check if already liked
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .single();

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);

    if (error) {
      console.error("Error removing like:", error);
      throw new Error("Failed to unlike property.");
    }

    return { liked: false };
  } else {
    // Like
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: user.id, listing_id: listingId });

    if (error) {
      console.error("Error adding like:", error);
      throw new Error("Failed to like property.");
    }

    return { liked: true };
  }
}

/**
 * Get all listing IDs liked by the current user.
 */
export async function getUserLikes(): Promise<number[]> {
  await connection();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("likes")
    .select("listing_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching likes:", error);
    return [];
  }

  return (data || []).map((row: any) => row.listing_id);
}

/**
 * Get full listing data for all properties liked by the current user.
 */
export async function getLikedListings() {
  await connection();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Get liked listing IDs
  const { data: likes, error: likesError } = await supabase
    .from("likes")
    .select("listing_id")
    .eq("user_id", user.id);

  if (likesError || !likes || likes.length === 0) return [];

  const listingIds = likes.map((l: any) => l.listing_id);

  // Fetch the actual listings
  const { data: listings, error: listingsError } = await supabase
    .from("listing")
    .select("*")
    .in("id", listingIds);

  if (listingsError) {
    console.error("Error fetching liked listings:", listingsError);
    return [];
  }

  return listings || [];
}
