"use client";

import { Bath, BedDouble, MapPin, Maximize, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  area: string;
  tag: string;
  gradient: string;
}

function formatPrice(price: number) {
  if (price >= 1000000) return `₱${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `₱${(price / 1000).toFixed(0)}K`;
  return `₱${price.toLocaleString()}`;
}

export default function FeaturedProperties() {
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("listing")
        .select("id, title, location, price, beds, baths, area, tag, gradient")
        .eq("active", true)
        .order("date", { ascending: false })
        .limit(6);

      if (!error && data) {
        setProperties(
          data.map((d) => ({ ...d, price: Number(d.price) }))
        );
      }
      setLoading(false);
    }
    fetchProperties();
  }, []);

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section id="featured-properties" className="py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4 tracking-wide">
            FEATURED LISTINGS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Top Properties
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 animate-pulse"
              >
                <div className="h-56 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-px bg-gray-100" />
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-100 rounded w-16" />
                    <div className="h-4 bg-gray-100 rounded w-16" />
                    <div className="h-4 bg-gray-100 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div
                key={property.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
              >
                {/* Image Placeholder with Gradient */}
                <div className="relative h-56 overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${property.gradient} opacity-90`}
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
                    onClick={() => toggleLike(property.id)}
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All */}
        <div className="text-center mt-12">
          <Button
            className="px-8 py-3 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => {
              window.location.href = "/properties";
            }}
          >
            View All Properties
          </Button>
        </div>
      </div>
    </section>
  );
}
