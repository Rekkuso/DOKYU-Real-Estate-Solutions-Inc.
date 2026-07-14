"use client";

import React, { useState } from "react";
import {
  FileText,
  Pencil,
  Trash2,
  Send,
  Loader2,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { publishListing, deleteListing, getListingById } from "../_actions/listing";
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
import { toast } from "sonner";

interface DraftListing {
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
  gradient: string;
  date: string;
}

interface DraftListingsProps {
  drafts: DraftListing[];
  loading: boolean;
  onRefresh: () => void;
}

function formatPrice(price: number) {
  if (price >= 1000000) return `₱${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `₱${(price / 1000).toFixed(0)}K`;
  return `₱${price.toLocaleString()}`;
}

export default function DraftListings({
  drafts,
  loading,
  onRefresh,
}: DraftListingsProps) {
  const [publishing, setPublishing] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DraftListing | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [loadingListing, setLoadingListing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const handlePublish = async (id: number) => {
    setPublishing(id);
    try {
      await publishListing(id);
      setSuccessMessage("Draft published successfully!");
      setSuccessOpen(true);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to publish listing.");
    } finally {
      setPublishing(null);
    }
  };

  const openDeleteConfirm = (draft: DraftListing) => {
    setDeleteTarget(draft);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      await deleteListing(deleteTarget.id);
      setDeleteOpen(false);
      setSuccessMessage("Draft deleted successfully!");
      setSuccessOpen(true);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete draft.");
    } finally {
      setDeleting(null);
    }
  };

  const openEditModal = async (id: number) => {
    setEditId(id);
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
    } catch {
      toast.error("Failed to fetch draft details.");
      setEditOpen(false);
    } finally {
      setLoadingListing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4"
          >
            <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No drafts yet
        </h3>
        <p className="text-gray-500 text-sm">
          Save a listing as draft and it will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow duration-200"
          >
            {/* Gradient preview */}
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${draft.gradient} flex items-center justify-center shrink-0`}
            >
              <FileText className="h-6 w-6 text-white/80" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {draft.title}
              </h4>
              <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{draft.location}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                <span className="font-semibold text-gray-800">
                  {formatPrice(draft.price)}
                </span>
                <span>·</span>
                <span>{draft.beds} beds</span>
                <span>·</span>
                <span>{draft.baths} baths</span>
                <span>·</span>
                <span>{draft.area}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handlePublish(draft.id)}
                disabled={publishing === draft.id}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-medium hover:bg-emerald-100 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {publishing === draft.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Publish
              </button>
              <button
                onClick={() => openEditModal(draft.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-all duration-200 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                onClick={() => openDeleteConfirm(draft)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Draft</DialogTitle>
            <DialogDescription>
              Update the draft details below.
            </DialogDescription>
          </DialogHeader>
          {loadingListing ? (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            editData &&
            editId && (
              <div className="mt-4">
                <ListingForm
                  isEditMode
                  propertyId={editId}
                  initialData={editData}
                  onCancel={() => setEditOpen(false)}
                  onSuccess={() => {
                    setEditOpen(false);
                    onRefresh();
                  }}
                />
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Delete Draft
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-500">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900">{deleteTarget?.title}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deleting !== null}
            >
              {deleting !== null ? (
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

      {/* Success Modal */}
      <Dialog
        open={successOpen}
        onOpenChange={(open) => {
          if (!open) setSuccessOpen(false);
        }}
      >
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Success
            </DialogTitle>
            <DialogDescription className="pt-2">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setSuccessOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
