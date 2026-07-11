"use client";

import React, { Suspense } from "react";
import { Loader2, ShieldX } from "lucide-react";
import { useAdmin } from "../../_hooks/useAdmin";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ListingForm from "../../_components/ListingForm";

function AddNewListingContent() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();

  // Loading state while checking admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        {/* Banner Skeleton */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-32 pb-8">
          <Skeleton className="w-full h-28 md:h-36 rounded-2xl md:rounded-3xl bg-gray-200" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="w-full rounded-2xl h-[600px] bg-white border border-gray-100" />
              <Skeleton className="w-full rounded-2xl h-[300px] bg-white border border-gray-100" />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <Skeleton className="w-full rounded-2xl h-[400px] bg-white border border-gray-100" />
              <Skeleton className="w-full rounded-2xl h-[500px] bg-white border border-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-4 pt-28 pb-12">
          <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="font-bold text-2xl mb-2 text-gray-900">
              Access Denied
            </h2>
            <p className="text-gray-500 mb-6">
              Only administrators can manage property listings. If you believe
              this is an error, please contact the site admin.
            </p>
            <Link href="/properties">
              <Button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/30 cursor-pointer">
                Back to Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Top Banner Container */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-32 pb-8">
        <div className="w-full bg-linear-to-br from-gray-900 via-blue-950 to-indigo-950 h-28 md:h-36 rounded-2xl md:rounded-3xl relative overflow-hidden flex items-center shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="w-full relative z-10 flex justify-between items-center h-full px-6 md:px-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Add New{" "}
              <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Property
              </span>
            </h1>
            {/* Building Illustration Placeholder */}
            <div className="hidden md:flex gap-3 opacity-60 absolute right-12 bottom-0 items-end">
              <div className="w-12 h-20 bg-white/20 rounded-t-lg backdrop-blur-sm"></div>
              <div className="w-16 h-32 bg-white/30 rounded-t-lg backdrop-blur-sm"></div>
              <div className="w-14 h-24 bg-white/20 rounded-t-lg backdrop-blur-sm"></div>
              <div className="w-20 h-16 bg-white/20 rounded-t-lg backdrop-blur-sm"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pb-12 relative z-20">
        {/* Main Form Content */}
        <ListingForm />
      </div>
    </div>
  );
}

export default function AddNewListing() {
  return (
    <Suspense>
      <AddNewListingContent />
    </Suspense>
  );
}
