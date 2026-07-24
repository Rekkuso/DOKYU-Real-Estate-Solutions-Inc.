"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Maximize,
  MapPin,
  Heart,
  Calendar,
  Home,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Tag,
} from "lucide-react";
import type { Listing } from "../_actions/listing";
import { getUserLikes, toggleLike as toggleLikeAction } from "../_actions/likes";
import { useAuthContext } from "../_context/AuthContext";
import AuthModal from "./AuthModal";
import Footer from "./Footer";
import { getDefaultGradient } from "@/utils/gradients";
import { toast } from "sonner";

/* ── Helpers ── */

function formatPrice(price: number) {
  if (price >= 1000000) return `₱${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `₱${(price / 1000).toFixed(0)}K`;
  return `₱${price.toLocaleString()}`;
}

function formatFullPrice(price: number) {
  return `₱${price.toLocaleString()}`;
}

/* ── Animation variants ── */

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/* ── Component ── */

interface PropertyDetailClientProps {
  listing: Listing;
  similarListings: Listing[];
}

export default function PropertyDetailClient({
  listing,
  similarListings,
}: PropertyDetailClientProps) {
  const { isSignedIn } = useAuthContext();
  const [liked, setLiked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const likeTimeout = useRef<NodeJS.Timeout | null>(null);

  const images = listing.images.length > 0 ? listing.images : [];
  const hasImages = images.length > 0;

  // Fetch user's like status for this listing
  useEffect(() => {
    if (!isSignedIn) return;
    async function fetchLikeStatus() {
      try {
        const likedIds = await getUserLikes();
        setLiked(likedIds.includes(listing.id));
      } catch {
        // silently fail
      }
    }
    fetchLikeStatus();
  }, [isSignedIn, listing.id]);

  const handleToggleLike = useCallback(() => {
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }

    // Optimistic update
    setLiked((prev) => !prev);

    if (likeTimeout.current) clearTimeout(likeTimeout.current);
    likeTimeout.current = setTimeout(async () => {
      try {
        await toggleLikeAction(listing.id);
      } catch {
        setLiked((prev) => !prev); // rollback
        toast.error("Failed to update like");
      }
    }, 300);
  }, [isSignedIn, listing.id]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out this property: ${listing.title}`,
          url,
        });
      } catch {
        // user cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  }, [listing.title]);

  const nextImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* ── Back Navigation Floating Pill Bar ── */}
      <div className="sticky top-[80px] z-40 max-w-7xl mx-auto px-4 py-2 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-auto inline-flex items-center justify-between gap-4 md:gap-6 px-5 py-2 bg-white/90 backdrop-blur-xl rounded-full border border-gray-200/80 shadow-lg shadow-gray-950/5"
        >
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Properties</span>
          </Link>

          <div className="h-4 w-px bg-gray-200" />

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button
              onClick={handleToggleLike}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                liked
                  ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-all ${
                  liked ? "fill-rose-500 scale-110" : ""
                }`}
              />
              {liked ? "Saved" : "Save"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Image Gallery ── */}
      <motion.section
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 pt-6 pb-2"
      >
        {hasImages ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 rounded-3xl overflow-hidden h-[300px] md:h-[460px]">
            {/* Primary Image */}
            <div
              className="lg:col-span-3 relative cursor-pointer group overflow-hidden"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={images[activeImageIndex]}
                alt={listing.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {/* Image counter badge */}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-medium">
                {activeImageIndex + 1} / {images.length}
              </div>

              {/* Navigation arrows on main image */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-16 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip (right column) */}
            {images.length > 1 && (
              <div className="hidden lg:flex flex-col gap-3">
                {images.slice(0, 3).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative flex-1 overflow-hidden cursor-pointer transition-all ${
                      activeImageIndex === i
                        ? "ring-3 ring-blue-500 ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${listing.title} - Photo ${i + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                ))}
                {images.length > 3 && (
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="relative flex-1 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={images[3]}
                      alt={`${listing.title} - More photos`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        +{images.length - 3}
                      </span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Gradient fallback when no images */
          <div
            className={`relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden bg-linear-to-br ${getDefaultGradient(listing.id)}`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-white/30 rounded-xl rotate-12" />
              <div className="absolute w-40 h-40 border border-white/10 rounded-full -top-6 -right-6" />
              <div className="absolute w-20 h-20 bg-white/10 rounded-lg bottom-8 left-8 rotate-6" />
            </div>
            <div className="absolute bottom-6 left-6">
              <Home className="h-12 w-12 text-white/60" />
            </div>
          </div>
        )}
      </motion.section>

      {/* ── Content Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column — Main Details ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <motion.div
              custom={0}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100">
                      {listing.tag}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs font-medium border border-gray-100">
                      {listing.type}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{listing.location}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {formatFullPrice(listing.price)}
                  </p>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1 justify-end">
                    <Calendar className="h-3 w-3" />
                    Listed{" "}
                    {new Date(listing.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <BedDouble className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {listing.beds}
                    </p>
                    <p className="text-xs text-gray-500">Bedrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Bath className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {listing.baths}
                    </p>
                    <p className="text-xs text-gray-500">Bathrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Maximize className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {listing.area}
                    </p>
                    <p className="text-xs text-gray-500">Total Area</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Facilities */}
            {listing.facilities && listing.facilities.length > 0 && (
              <motion.div
                custom={1}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Facilities & Amenities
                    </h2>
                    <p className="text-xs text-gray-400">
                      What this property offers
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {listing.facilities.map((facility, i) => (
                    <motion.span
                      key={facility}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="px-4 py-2 rounded-full bg-gray-50 text-gray-700 text-sm font-medium border border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                    >
                      {facility}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Location Card */}
            <motion.div
              custom={2}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Location</h2>
                  <p className="text-xs text-gray-400">
                    Property address and area
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {listing.address}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {listing.location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right Column — Sidebar ── */}
          <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-[140px] self-start">
            {/* Price & Actions Card */}
            <motion.div
              custom={1}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-sm text-gray-400 uppercase tracking-widest font-medium mb-1">
                    Listed Price
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {formatFullPrice(listing.price)}
                  </p>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Property Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="font-semibold text-gray-900">
                      {listing.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className="font-semibold text-gray-900">
                      {listing.tag}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bedrooms</span>
                    <span className="font-semibold text-gray-900">
                      {listing.beds}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bathrooms</span>
                    <span className="font-semibold text-gray-900">
                      {listing.baths}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Area</span>
                    <span className="font-semibold text-gray-900">
                      {listing.area}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleToggleLike}
                    className={`w-full py-3 px-4 rounded-2xl font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      liked
                        ? "bg-rose-50 text-rose-600 border-2 border-rose-200 hover:bg-rose-100"
                        : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${liked ? "fill-rose-500" : ""}`}
                    />
                    {liked ? "Property Saved" : "Save Property"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full py-3 px-4 rounded-2xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Listing
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Listed Date Mini Card */}
            <motion.div
              custom={2}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Listed on</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {new Date(listing.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Similar Properties ── */}
      {similarListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <motion.div
            custom={3}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Tag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  You May Also Like
                </h2>
                <p className="text-sm text-gray-400">
                  Similar {listing.type.toLowerCase()} in our collection
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarListings.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                >
                  <Link
                    href={`/properties/${property.id}`}
                    className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 bg-linear-to-br ${getDefaultGradient(property.id)} opacity-90`}
                        />
                      )}
                      {property.images && property.images.length > 0 && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/30">
                          {property.tag}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xl font-bold text-white drop-shadow-lg">
                          {formatPrice(property.price)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 truncate">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </div>
                      <div className="h-px bg-gray-100 mb-3" />
                      <div className="flex items-center justify-between text-gray-500 text-xs">
                        <div className="flex items-center gap-1">
                          <BedDouble className="h-3.5 w-3.5 text-blue-500" />
                          <span>{property.beds} Beds</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-blue-500" />
                          <span>{property.baths} Baths</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize className="h-3.5 w-3.5 text-blue-500" />
                          <span>{property.area}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Lightbox Modal ── */}
      <AnimatePresence>
        {lightboxOpen && hasImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer z-50"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image counter */}
            <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium z-50">
              {activeImageIndex + 1} / {images.length}
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer z-50"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer z-50"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}

            {/* Main Image */}
            <motion.img
              key={activeImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              src={images[activeImageIndex]}
              alt={`${listing.title} - Photo ${activeImageIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md z-50">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(i);
                    }}
                    className={`w-14 h-10 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      activeImageIndex === i
                        ? "ring-2 ring-white scale-110"
                        : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
