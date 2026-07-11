"use client";

import { Search, MapPin, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/backgroundPhoto.webp')" }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/80" />

      {/* Animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Trusted by 10,000+ homeowners nationwide
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
          Find Your{" "}
          <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Dream Home
          </span>
          <br />
          With DOKYU
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Discover
          premium properties across the Philippines with our trusted real estate
          solutions.
        </p>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto mb-12">
          <div className="relative flex-1 w-full">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by city, neighborhood, or ZIP code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/95 backdrop-blur-sm text-gray-800 placeholder-gray-400 text-base border-0 outline-none focus:ring-2 focus:ring-blue-500/50 shadow-2xl transition-all duration-300"
            />
          </div>
          <Button className="w-full sm:w-auto px-8 py-4 h-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-base shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40 cursor-pointer">
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>

        {/* Quick filter pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {["Houses", "Condos", "Apartments", "Townhouses", "Commercial"].map(
            (type) => (
              <button
                key={type}
                className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-medium hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                {type}
              </button>
            ),
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "15K+", label: "Properties Listed", icon: Home },
            { value: "8K+", label: "Happy Clients", icon: Building2 },
            { value: "200+", label: "Expert Agents", icon: MapPin },
            { value: "99%", label: "Client Satisfaction", icon: Search },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105"
            >
              <stat.icon className="h-5 w-5 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
