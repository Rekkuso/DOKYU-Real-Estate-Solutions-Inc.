"use client";

import { useState } from "react";
import { Pencil, Trash2, Loader2, Building } from "lucide-react";
import { toast } from "sonner";
import { deleteListing } from "../_actions/listing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AdminPropertyActionsProps {
  id: number;
  title: string;
  onEditSuccess?: () => void; // Keeping for compatibility, though might not be used now
  onDeleteSuccess: (id?: number) => void;
}

export default function AdminPropertyActions({
  id,
  title,
  onEditSuccess,
  onDeleteSuccess,
}: AdminPropertyActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/edit-listing/${id}`);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-all duration-200 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDeleteOpen(true);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all duration-200 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

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
