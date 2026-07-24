"use client";

import { useState } from "react";
import { Pencil, Trash2, Loader2, Building } from "lucide-react";
import { toast } from "sonner";
import { deleteListing, getListingById } from "../_actions/listing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ListingForm from "./ListingForm";

interface AdminPropertyActionsProps {
  id: number;
  title: string;
  onEditSuccess?: () => void;
  onDeleteSuccess: (id?: number) => void;
}

export default function AdminPropertyActions({
  id,
  title,
  onEditSuccess,
  onDeleteSuccess,
}: AdminPropertyActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loadingListing, setLoadingListing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editData, setEditData] = useState<Record<string, string> | null>(null);
  const [editImages, setEditImages] = useState<string[]>([]);

  const handleOpenEdit = async () => {
    setEditOpen(true);
    setLoadingListing(true);

    try {
      const listing = await getListingById(id);

      setEditData({
        title: listing.title || "",
        location: listing.location || "",
        address: listing.address || "",
        price: listing.price ? String(listing.price) : "",
        beds: listing.beds ? String(listing.beds) : "0",
        baths: listing.baths ? String(listing.baths) : "0",
        area: listing.area || "",
        type: listing.type || "Houses",
        tag: listing.tag || "",
        facilities: listing.facilities ? JSON.stringify(listing.facilities) : "[]",
      });

      setEditImages(listing.images || []);
    } catch (err: any) {
      toast.error("Failed to load property details.");
      setEditOpen(false);
    } finally {
      setLoadingListing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteListing(id);
      toast.success("Listing deleted successfully!");
      setDeleteOpen(false);
      onDeleteSuccess(id);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete listing.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleOpenEdit}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-all duration-200 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all duration-200 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] p-0 rounded-3xl border-none shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-gray-900 via-blue-950 to-indigo-950 p-6 md:p-8 text-white shrink-0 relative">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 backdrop-blur-md border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                  Edit Property Listing
                </DialogTitle>
                <DialogDescription className="text-blue-200/80 text-sm mt-0.5">
                  Update property details, location, facilities, and upload photos.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-100px)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full bg-slate-50/50">
            {loadingListing ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
                {/* Left Column Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                  {/* About Property Skeleton Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <Skeleton className="w-10 h-10 rounded-2xl bg-gray-200" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-5 w-40 rounded-lg bg-gray-200" />
                        <Skeleton className="h-3 w-56 rounded-md bg-gray-100" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24 rounded-md bg-gray-200" />
                        <Skeleton className="h-11 w-full rounded-xl bg-gray-100" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24 rounded-md bg-gray-200" />
                        <Skeleton className="h-11 w-full rounded-xl bg-gray-100" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24 rounded-md bg-gray-200" />
                        <Skeleton className="h-11 w-full rounded-xl bg-gray-100" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24 rounded-md bg-gray-200" />
                        <Skeleton className="h-11 w-full rounded-xl bg-gray-100" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-28 rounded-md bg-gray-200" />
                      <Skeleton className="h-24 w-full rounded-2xl bg-gray-100" />
                    </div>
                  </div>

                  {/* Location Skeleton Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <Skeleton className="w-10 h-10 rounded-2xl bg-gray-200" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-5 w-36 rounded-lg bg-gray-200" />
                        <Skeleton className="h-3 w-48 rounded-md bg-gray-100" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24 rounded-md bg-gray-200" />
                        <Skeleton className="h-11 w-full rounded-xl bg-gray-100" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24 rounded-md bg-gray-200" />
                        <Skeleton className="h-11 w-full rounded-xl bg-gray-100" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="flex gap-4 pt-2">
                    <Skeleton className="h-14 flex-1 rounded-2xl bg-gray-200" />
                    <Skeleton className="h-14 flex-1 rounded-2xl bg-gray-200" />
                    <Skeleton className="h-14 flex-1 rounded-2xl bg-gray-300" />
                  </div>
                </div>

                {/* Right Column Skeleton */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Upload Images Skeleton Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                      <Skeleton className="w-10 h-10 rounded-2xl bg-gray-200" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-5 w-32 rounded-lg bg-gray-200" />
                        <Skeleton className="h-3 w-40 rounded-md bg-gray-100" />
                      </div>
                    </div>
                    <Skeleton className="h-44 w-full rounded-2xl bg-gray-100" />
                    <div className="flex gap-2">
                      <Skeleton className="w-16 h-16 rounded-2xl bg-gray-200" />
                      <Skeleton className="w-16 h-16 rounded-2xl bg-gray-200" />
                      <Skeleton className="w-16 h-16 rounded-2xl bg-gray-200" />
                    </div>
                  </div>

                  {/* Facilities Skeleton Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                      <Skeleton className="w-10 h-10 rounded-2xl bg-gray-200" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-5 w-28 rounded-lg bg-gray-200" />
                        <Skeleton className="h-3 w-36 rounded-md bg-gray-100" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Skeleton key={i} className="h-8 w-20 rounded-full bg-gray-100" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              editData && (
                <ListingForm
                  key={id}
                  isEditMode
                  propertyId={id}
                  initialData={editData}
                  existingImages={editImages}
                  onCancel={() => setEditOpen(false)}
                  onSuccess={() => {
                    setEditOpen(false);
                    if (onEditSuccess) onEditSuccess();
                  }}
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Delete Property
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-500">
              Are you absolutely sure you want to delete{" "}
              <strong className="text-gray-900">{title}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
