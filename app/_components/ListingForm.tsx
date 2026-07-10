"use client";

import React, { useState, useRef } from "react";
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
import {
  Loader2,
  ImagePlus,
  X,
  MapPin,
  Home,
  BedDouble,
  Bath,
  Maximize,
  Tag,
} from "lucide-react";

interface ListingFormProps {
  initialData?: Record<string, string>;
  isEditMode?: boolean;
  propertyId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FACILITIES_LIST = [
  "Air conditions",
  "BBQ Area",
  "Wi-Fi",
  "Swimming Pool",
  "Gym",
  "Garden",
  "Parking",
  "Family Rooms",
  "Spa",
  "Sauna",
  "Lobby",
  "Playground",
  "Laundry",
];

export default function ListingForm({
  initialData = {},
  isEditMode = false,
  propertyId,
  onSuccess,
  onCancel,
}: ListingFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility],
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Append facilities and image to formData
      formData.append("facilities", JSON.stringify(selectedFacilities));
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      if (isEditMode && propertyId) {
        await updateListing(propertyId, formData);
        toast.success("Property listing updated successfully!");
        if (onSuccess) onSuccess();
      } else {
        await addListing(formData);
        toast.success("Property listing added successfully!");
        form.reset();
        setSelectedImage(null);
        setImagePreview(null);
        setSelectedFacilities([]);
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-5"
    >
      {/* Left Column (col-span-2) */}
      <div className="lg:col-span-2 space-y-5">
        {/* About Properties Card */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" /> About Property
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-600">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. White dream house"
                className="rounded-xl border-gray-200 focus-visible:ring-blue-500"
                defaultValue={initialData.title || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-600">
                Category
              </Label>
              <Select
                name="type"
                required
                defaultValue={initialData.type || "Houses"}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:ring-blue-500">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2 relative">
              <Label htmlFor="price" className="text-gray-600">
                Base pricing
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  ₱
                </span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  className="pl-8 rounded-xl border-gray-200 focus-visible:ring-blue-500"
                  placeholder="25,500,000"
                  defaultValue={initialData.price || ""}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="area" className="text-gray-600">
                Floor Area
              </Label>
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="area"
                  name="area"
                  className="pl-9 rounded-xl border-gray-200 focus-visible:ring-blue-500"
                  placeholder="e.g. 350 sqm"
                  defaultValue={initialData.area || ""}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="beds" className="text-gray-600">
                Total bedrooms
              </Label>
              <div className="relative">
                <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="beds"
                  name="beds"
                  type="number"
                  min="0"
                  className="pl-9 rounded-xl border-gray-200 focus-visible:ring-blue-500"
                  defaultValue={initialData.beds || "0"}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baths" className="text-gray-600">
                Total bathrooms
              </Label>
              <div className="relative">
                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="baths"
                  name="baths"
                  type="number"
                  min="0"
                  className="pl-9 rounded-xl border-gray-200 focus-visible:ring-blue-500"
                  defaultValue={initialData.baths || "0"}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-600">
              Descriptions property
            </Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Enter descriptions...."
              className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-shadow"
              defaultValue={initialData.description || ""}
            ></textarea>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-600">
                City/Province
              </Label>
              <Input
                id="location"
                name="location"
                className="rounded-xl border-gray-200 focus-visible:ring-blue-500"
                placeholder="e.g. Makati City, Metro Manila"
                defaultValue={initialData.location || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-600">
                Full Address
              </Label>
              <Input
                id="address"
                name="address"
                className="rounded-xl border-gray-200 focus-visible:ring-blue-500"
                placeholder="e.g. 123 Ayala Ave, Makati"
                defaultValue={initialData.address || ""}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tag" className="text-gray-600">
                Tag / Badge
              </Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="tag"
                  name="tag"
                  className="pl-9 rounded-xl border-gray-200 focus-visible:ring-blue-500"
                  placeholder="e.g. Featured, New"
                  defaultValue={initialData.tag || ""}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-6 text-sm font-semibold rounded-xl border border-gray-200 transition-all duration-300 cursor-pointer"
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-6 text-sm font-semibold rounded-xl border border-gray-200 transition-all duration-300 cursor-pointer"
          >
            Draft
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : isEditMode ? (
              "Update Property"
            ) : (
              "Add Property"
            )}
          </Button>
        </div>
      </div>

      {/* Right Column (col-span-1) */}
      <div className="lg:col-span-1 space-y-6">
        {/* Upload Image Card */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-blue-600" /> Upload image
          </h3>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <div
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            className={`rounded-xl overflow-hidden mb-4 relative group h-48 border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${
              imagePreview
                ? "border-transparent bg-gray-100"
                : "border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
            }`}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-full shadow-md bg-white text-gray-800 hover:bg-gray-100 px-6 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="rounded-full shadow-md bg-white text-red-600 hover:bg-red-50 hover:text-red-700 px-6 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  Click to upload image
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {imagePreview && (
              <div
                className="w-16 h-16 rounded-xl border border-blue-500 shrink-0 bg-cover bg-center ring-2 ring-blue-100"
                style={{ backgroundImage: `url(${imagePreview})` }}
              ></div>
            )}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500 transition-colors text-gray-400"
            >
              <span className="text-xl">+</span>
            </div>
          </div>
        </div>

        {/* Facilities Card */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Facilities</h3>
          <p className="text-sm text-gray-500 mb-4">
            Select amenities included
          </p>

          <div className="flex flex-wrap gap-2">
            {FACILITIES_LIST.map((facility) => {
              const isSelected = selectedFacilities.includes(facility);
              return (
                <button
                  key={facility}
                  type="button"
                  onClick={() => toggleFacility(facility)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {facility}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-8 rounded-xl border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 py-6 font-semibold transition-all cursor-pointer"
          >
            + Add custom category
          </Button>
        </div>
      </div>
    </form>
  );
}
