/**
 * Shared type definitions for listing-related data.
 * Centralized here to avoid coupling UI components to server action modules.
 */

export interface Listing {
  id: number;
  title: string;
  location: string;
  address: string;
  description?: string;
  price: number;
  beds: number;
  baths: number;
  area: string;
  type: string;
  tag: string;
  facilities?: string[];
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

export interface DraftListing {
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
}
