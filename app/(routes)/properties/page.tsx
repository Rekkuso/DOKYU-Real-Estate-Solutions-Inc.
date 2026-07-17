"use client";

import { Skeleton } from "@/components/ui/skeleton";

import {
  Search,
  MapPin,
  Home,
  BedDouble,
  Bath,
  Maximize,
  Heart,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "../../_components/Footer";
import AdminPropertyActions from "../../_components/AdminPropertyActions";
import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAdmin } from "../../_hooks/useAdmin";
import { searchListings, deleteListing } from "../../_actions/listing";
import type { Listing, ListingSearchResult } from "../../_actions/listing";
import { toast } from "sonner";
import { getUserLikes, toggleLike as toggleLikeAction } from "../../_actions/likes";
import { useAuthContext } from "../../_context/AuthContext";


/* ───────────────────────── Data is fetched from Supabase ───────────────────────── */

const propertyTypes = [
  "All",
  "Houses",
  "Condos",
  "Apartments",
  "Townhouses",
  "Commercial",
];

const priceRanges = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under ₱5M", min: 0, max: 5000000 },
  { label: "₱5M – ₱10M", min: 5000000, max: 10000000 },
  { label: "₱10M – ₱20M", min: 10000000, max: 20000000 },
  { label: "₱20M – ₱35M", min: 20000000, max: 35000000 },
  { label: "₱35M+", min: 35000000, max: Infinity },
];

const bedroomOptions = ["Any", "1", "2", "3", "4", "5+"];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
];

const ITEMS_PER_PAGE = 9;

/* ───────────────────── Helpers ───────────────────── */

function formatPrice(price: number) {
  if (price >= 1000000) return `₱${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `₱${(price / 1000).toFixed(0)}K`;
  return `₱${price.toLocaleString()}`;
}

/* ───────────────────── Component ───────────────────── */

function PropertiesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialType = searchParams.get("type") || "All";
  const initialSearch = searchParams.get("q") || "";
  const { isAdmin } = useAdmin();

  // Server-driven result state
  const [results, setResults] = useState<ListingSearchResult>({
    listings: [],
    totalCount: 0,
    page: 1,
    perPage: ITEMS_PER_PAGE,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [activeType, setActiveType] = useState(initialType);
  const [priceRange, setPriceRange] = useState(0);
  const [bedrooms, setBedrooms] = useState("Any");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // UI state
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const { isSignedIn } = useAuthContext();
  const [togglingLike, setTogglingLike] = useState<number | null>(null);

  // Debounce search input (300ms)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Fetch likes
  useEffect(() => {
    if (isSignedIn) {
      getUserLikes().then((likes) => setLiked(new Set(likes))).catch(console.error);
    } else {
      setLiked(new Set());
    }
  }, [isSignedIn]);

  // Fetch listings from server whenever filters change
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const range = priceRanges[priceRange];
      const data = await searchListings({
        query: debouncedSearch || undefined,
        type: activeType,
        priceMin: range.min > 0 ? range.min : undefined,
        priceMax: range.max < Infinity ? range.max : undefined,
        beds: bedrooms,
        sortBy: sortBy as "newest" | "price-asc" | "price-desc",
        page: currentPage,
        perPage: ITEMS_PER_PAGE,
      });
      setResults(data);
    } catch (error) {
      console.error("Failed to search listings:", error);
      toast.error("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeType, priceRange, bedrooms, sortBy, currentPage]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleToggleLike = async (id: number) => {
    if (!isSignedIn) {
      toast.error("Please sign in to like properties.");
      return;
    }
    if (togglingLike === id) return;

    setTogglingLike(id);
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      await toggleLikeAction(id);
    } catch {
      setLiked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      toast.error("Failed to update like.");
    } finally {
      setTogglingLike(null);
    }
  };

  /* ─── Derived values from server result ─── */

  const { listings: paginated, totalCount, totalPages } = results;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const activeFilterCount =
    (activeType !== "All" ? 1 : 0) +
    (priceRange !== 0 ? 1 : 0) +
    (bedrooms !== "Any" ? 1 : 0) +
    (debouncedSearch.trim() ? 1 : 0);

  const clearAll = () => {
    setSearch("");
    setDebouncedSearch("");
    setActiveType("All");
    setPriceRange(0);
    setBedrooms("Any");
    setSortBy("newest");
    setCurrentPage(1);
  };

  /* ─── Page Numbers ─── */

  const pageNumbers = (() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, safeCurrentPage - 1);
        i <= Math.min(totalPages - 1, safeCurrentPage + 1);
        i++
      )
        pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  })();


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ───────── Hero Banner ───────── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/backgroundPhoto.webp')" }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/60 to-black/85" />

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8 animate-fade-in">
            <Home className="w-4 h-4 text-blue-400" />
            Property Listings
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight animate-fade-in">
            Explore{" "}
            <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Properties
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-500">
            Browse our curated selection of premium properties across the
            Philippines.
          </p>
        </div>
      </section>

      {/* ───────── Search & Filters ───────── */}
      <section className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Row 1: Search + Filter Toggle + Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <input
                id="property-search"
                type="text"
                placeholder="Search by name or location..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-100 text-gray-800 placeholder-gray-400 text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all duration-200"
              />
            </div>

            {/* Filter Toggle */}
            <button
              id="filter-toggle"
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 cursor-pointer ${
                showFilters || activeFilterCount > 0
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-150"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all duration-200 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: Expandable Filters */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              showFilters
                ? "grid-rows-[1fr] opacity-100 mt-4"
                : "grid-rows-[0fr] opacity-0 mt-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-1">
                {/* Property Type Pills */}
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setActiveType(type);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                        activeType === type
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="h-6 w-px bg-gray-200 hidden sm:block" />

                {/* Price Range */}
                <div className="relative">
                  <select
                    id="price-range-select"
                    value={priceRange}
                    onChange={(e) => {
                      setPriceRange(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                  >
                    {priceRanges.map((r, i) => (
                      <option key={i} value={i}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>

                {/* Bedrooms */}
                <div className="relative">
                  <select
                    id="bedrooms-select"
                    value={bedrooms}
                    onChange={(e) => {
                      setBedrooms(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                  >
                    {bedroomOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === "Any" ? "Any Beds" : `${opt} Bed${opt === "1" ? "" : "s"}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>

                {/* Clear All */}
                {activeFilterCount > 0 && (
                  <button
                    id="clear-filters"
                    onClick={clearAll}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Results Count ───────── */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-2">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-800">
            {totalCount}
          </span>{" "}
          {totalCount === 1 ? "property" : "properties"}
          {activeType !== "All" && (
            <span>
              {" "}
              in{" "}
              <span className="font-semibold text-blue-600">{activeType}</span>
            </span>
          )}
        </p>
      </div>

      {/* ───────── Property Grid ───────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
              >
                <Skeleton className="h-56 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="h-px bg-gray-100" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
              <Home className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No properties found
            </h3>
            <p className="text-gray-400 mb-6 max-w-sm">
              Try adjusting your search or filters to find what you&apos;re
              looking for.
            </p>
            <Button
              onClick={clearAll}
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl cursor-pointer"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
            {paginated.map((property, index) => (
              <div
                key={property.id}
                className={`group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 animate-slide-up stagger-${index + 1}`}
              >
                {/* Image Placeholder with Gradient */}
                <div className="relative h-56 overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${property.gradient} opacity-90`}
                  />
                  {/* Decorative elements */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 border-2 border-white/30 rounded-xl rotate-12 group-hover:rotate-45 transition-transform duration-700" />
                    <div className="absolute w-32 h-32 border border-white/10 rounded-full -top-4 -right-4" />
                    <div className="absolute w-16 h-16 bg-white/10 rounded-lg bottom-4 left-4 rotate-6" />
                  </div>

                  {/* Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/30">
                      {property.tag}
                    </span>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => handleToggleLike(property.id)}
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 transition-all duration-300 cursor-pointer"
                  >
                    <Heart
                      className={`h-4 w-4 transition-all ${
                        liked.has(property.id)
                          ? "fill-rose-500 text-rose-500 scale-110"
                          : ""
                      }`}
                    />
                  </button>

                  {/* Price */}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-2xl font-bold text-white drop-shadow-lg">
                      {formatPrice(property.price)}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                    <MapPin className="h-3.5 w-3.5" />
                    {property.location}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 mb-4" />

                  {/* Details */}
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="h-4 w-4 text-blue-500" />
                      <span>{property.beds} Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4 text-blue-500" />
                      <span>{property.baths} Baths</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize className="h-4 w-4 text-blue-500" />
                      <span>{property.area}</span>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <AdminPropertyActions
                      id={property.id}
                      title={property.title}
                      onEditSuccess={fetchListings}
                      onDeleteSuccess={fetchListings}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ───────── Pagination ───────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              id="pagination-prev"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pageNumbers.map((page, i) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    safeCurrentPage === page
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              id="pagination-next"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={safeCurrentPage === totalPages}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>

      {/* ───────── Footer ───────── */}
      <Footer />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense>
      <PropertiesPageContent />
    </Suspense>
  );
}
