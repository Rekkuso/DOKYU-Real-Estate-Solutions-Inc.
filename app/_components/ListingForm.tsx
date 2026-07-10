"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addListing, updateListing } from "../_actions/listing";
import { Loader2 } from "lucide-react";

interface ListingFormProps {
  initialData?: Record<string, string>;
  isEditMode?: boolean;
  propertyId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ListingForm({
  initialData = {},
  isEditMode = false,
  propertyId,
  onSuccess,
  onCancel,
}: ListingFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      if (isEditMode && propertyId) {
        await updateListing(propertyId, formData);
        toast.success("Property listing updated successfully!");
        if (onSuccess) onSuccess();
      } else {
        await addListing(formData);
        toast.success("Property listing added successfully!");
        form.reset();
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Property Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Modern Luxury Villa"
            defaultValue={initialData.title || ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
          <Select name="type" required defaultValue={initialData.type || "Houses"}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Houses">Houses</SelectItem>
              <SelectItem value="Condos">Condos</SelectItem>
              <SelectItem value="Apartments">Apartments</SelectItem>
              <SelectItem value="Townhouses">Townhouses</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location & Address */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="location">City/Province (Location)</Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g. Makati City, Metro Manila"
            defaultValue={initialData.location || ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Full Address</Label>
          <Input
            id="address"
            name="address"
            placeholder="e.g. 123 Ayala Ave, Makati"
            defaultValue={initialData.address || ""}
            required
          />
        </div>
      </div>

      {/* Price & Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₱)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            placeholder="e.g. 25500000"
            defaultValue={initialData.price || ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Floor Area (sqm)</Label>
          <Input
            id="area"
            name="area"
            placeholder="e.g. 350 sqm"
            defaultValue={initialData.area || ""}
            required
          />
        </div>
      </div>

      {/* Beds, Baths, Tag */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="beds">Bedrooms</Label>
          <Input
            id="beds"
            name="beds"
            type="number"
            min="0"
            defaultValue={initialData.beds || "0"}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="baths">Bathrooms</Label>
          <Input
            id="baths"
            name="baths"
            type="number"
            min="0"
            defaultValue={initialData.baths || "0"}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tag">Tag</Label>
          <Input
            id="tag"
            name="tag"
            placeholder="e.g. Featured, New"
            defaultValue={initialData.tag || ""}
          />
        </div>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-6 text-lg font-semibold rounded-xl border border-gray-200 transition-all duration-300 cursor-pointer"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isEditMode ? "Updating..." : "Saving..."}
            </>
          ) : isEditMode ? (
            "Update Property Listing"
          ) : (
            "Add Property Listing"
          )}
        </Button>
      </div>
    </form>
  );
}
