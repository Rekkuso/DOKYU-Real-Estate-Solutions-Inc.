"use client";

import React, { Suspense } from "react";
import { Loader2, ShieldX } from "lucide-react";
import { useAdmin } from "../../_hooks/useAdmin";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ListingForm from "../../_components/ListingForm";

function AddNewListingContent() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();

  // Loading state while checking admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-4 pt-28 pb-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Checking permissions...</p>
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
            <h2 className="font-bold text-2xl mb-2 text-gray-900">Access Denied</h2>
            <p className="text-gray-500 mb-6">
              Only administrators can manage property listings. If you believe this is an error, please contact the site admin.
            </p>
            <Link href="/properties">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/30 cursor-pointer">
                Back to Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-28 pb-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl">
          <h2 className="font-bold text-3xl mb-2 text-gray-900">
            Add New Listing
          </h2>
          <p className="text-gray-500 mb-8">
            Enter the property details below to add it to the database.
          </p>
          <ListingForm />
        </div>
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
