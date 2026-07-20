"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MapPin, BedDouble, Bath, Maximize } from "lucide-react";
import { getDefaultGradient } from "@/utils/gradients";

// Format price utility (you might want to extract this to a shared utils file later,
// but for now we define it here as it was in AdminDashboard)
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function LikesTab({
  listings,
  loading,
  onUnlike,
}: {
  listings: any[];
  loading: boolean;
  onUnlike: (id: number) => void;
}) {
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Liked Properties</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Properties you've liked
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
            >
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Liked Properties</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Properties you've liked ({listings.length})
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No liked properties
          </h3>
          <p className="text-gray-500 text-sm">
            Like properties from the listings page to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((listing: any) => (
            <div
              key={listing.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Image or Gradient header */}
              <div className="relative h-40 overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <>
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  </>
                ) : (
                  <>
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${getDefaultGradient(listing.id)} opacity-90`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-white/30 rounded-xl rotate-12 group-hover:rotate-45 transition-transform duration-700" />
                    </div>
                  </>
                )}

                {/* Tag */}
                {listing.tag && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/30">
                      {listing.tag}
                    </span>
                  </div>
                )}

                {/* Unlike button */}
                <button
                  onClick={() => onUnlike(listing.id)}
                  className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-red-500/80 transition-all duration-300 cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                </button>

                {/* Price */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-xl font-bold text-white drop-shadow-lg">
                    {formatPrice(Number(listing.price))}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                  {listing.title}
                </h3>
                <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{listing.location}</span>
                </div>
                <div className="h-px bg-gray-100 mb-3" />
                <div className="flex items-center justify-between text-gray-500 text-sm">
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="h-4 w-4 text-blue-500" />
                    <span>{listing.beds} Beds</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="h-4 w-4 text-blue-500" />
                    <span>{listing.baths} Baths</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Maximize className="h-4 w-4 text-blue-500" />
                    <span>{listing.area}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
