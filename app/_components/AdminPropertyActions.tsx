"use client";

import { useState } from "react";
import { Pencil, Trash2, CheckCircle2, Loader2 } from "lucide-react";
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
  onDeleteSuccess: (id: number) => void;
}

export default function AdminPropertyActions({
  id,
  title,
  onEditSuccess,
  onDeleteSuccess,
}: AdminPropertyActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [loadingListing, setLoadingListing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const openEditModal = async () => {
    setEditOpen(true);
    setLoadingListing(true);
    try {
      const data = await getListingById(id);
      setEditData({
        title: data.title || "",
        type: data.type || "Houses",
        location: data.location || "",
        address: data.address || "",
        price: String(data.price || ""),
        area: data.area || "",
        beds: String(data.beds || 0),
        baths: String(data.baths || 0),
        tag: data.tag || "",
      });
    } catch (error) {
      toast.error("Failed to fetch property details for editing.");
      setEditOpen(false);
    } finally {
      setLoadingListing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteListing(id);
      setDeleteOpen(false);
      setDeleteSuccessOpen(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete listing.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseSuccess = () => {
    setDeleteSuccessOpen(false);
    onDeleteSuccess(id);
  };

  return (
    <>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={openEditModal}
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
        <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Edit Listing
            </DialogTitle>
            <DialogDescription>
              Update the property details below.
            </DialogDescription>
          </DialogHeader>

          {loadingListing ? (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          ) : (
            editData && (
              <div className="mt-4">
                <ListingForm
                  isEditMode
                  propertyId={id}
                  initialData={editData}
                  onCancel={() => setEditOpen(false)}
                  onSuccess={() => {
                    setEditOpen(false);
                    if (onEditSuccess) onEditSuccess();
                  }}
                />
              </div>
            )
          )}
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
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
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

      {/* Delete Success Modal */}
      <Dialog open={deleteSuccessOpen} onOpenChange={(open) => {
        if (!open) handleCloseSuccess();
      }}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Successfully Deleted
            </DialogTitle>
            <DialogDescription className="pt-2">
              The property listing has been permanently removed from the
              database.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCloseSuccess}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
