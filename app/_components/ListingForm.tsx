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
  Sparkles,
} from "lucide-react";

const MAX_IMAGES = 10;

interface ListingFormProps {
  initialData?: Record<string, string>;
  /** Existing image URLs (for edit mode) */
  existingImages?: string[];
  isEditMode?: boolean;
  propertyId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DEFAULT_FACILITIES = [
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
  existingImages: initialExistingImages = [],
  isEditMode = false,
  propertyId,
  onSuccess,
  onCancel,
}: ListingFormProps) {
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialExistingImages);
  const [type, setType] = useState<string>(initialData.type || "Houses");
  const [tag, setTag] = useState<string>(initialData.tag || "");

  React.useEffect(() => {
    if (initialData.type) setType(initialData.type);
    if (initialData.tag !== undefined) setTag(initialData.tag);
    if (initialExistingImages && initialExistingImages.length > 0) {
      setExistingImages(initialExistingImages);
    }
  }, [initialData, initialExistingImages]);

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse initial facilities if provided
  const parsedInitialFacilities: string[] = (() => {
    if (!initialData.facilities) return [];
    try {
      return typeof initialData.facilities === "string"
        ? JSON.parse(initialData.facilities)
        : Array.isArray(initialData.facilities)
        ? initialData.facilities
        : [];
    } catch {
      return [];
    }
  })();

  const [facilitiesList, setFacilitiesList] = useState<string[]>(() => {
    const list = [...DEFAULT_FACILITIES];
    for (const f of parsedInitialFacilities) {
      if (!list.includes(f)) {
        list.push(f);
      }
    }
    return list;
  });

  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(parsedInitialFacilities);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customFacility, setCustomFacility] = useState("");

  const handleAddCustomFacility = () => {
    const trimmed = customFacility.trim();
    if (!trimmed) return;

    if (!facilitiesList.includes(trimmed)) {
      setFacilitiesList((prev) => [...prev, trimmed]);
    }
    if (!selectedFacilities.includes(trimmed)) {
      setSelectedFacilities((prev) => [...prev, trimmed]);
    }

    toast.success(`Added custom category "${trimmed}"`);
    setCustomFacility("");
    setShowAddCustom(false);
  };

  const totalImageCount = existingImages.length + selectedImages.length;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    const remaining = MAX_IMAGES - totalImageCount;

    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    if (newFiles.length > remaining) {
      toast.warning(
        `Only ${remaining} more image${remaining > 1 ? "s" : ""} can be added. Selecting the first ${remaining}.`,
      );
    }

    const filesToAdd = newFiles.slice(0, remaining);
    const newPreviews = filesToAdd.map((f) => URL.createObjectURL(f));

    setSelectedImages((prev) => [...prev, ...filesToAdd]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility],
    );
  };

  const handleDeleteCategory = (facilityToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFacilitiesList((prev) => prev.filter((f) => f !== facilityToDelete));
    setSelectedFacilities((prev) => prev.filter((f) => f !== facilityToDelete));
    toast.success(`Removed category "${facilityToDelete}"`);
  };

  const handleSaveDraft = async () => {
    if (!formRef.current) return;
    setDraftLoading(true);

    try {
      const formData = new FormData(formRef.current);
      formData.append("isDraft", "true");
      formData.append("facilities", JSON.stringify(selectedFacilities));

      for (const file of selectedImages) {
        formData.append("images", file);
      }

      if (isEditMode) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }

      if (isEditMode && propertyId) {
        await updateListing(propertyId, formData);
        toast.success("Property updated and saved as draft!");
      } else {
        await addListing(formData);
        toast.success("Property saved as draft successfully!");
        formRef.current.reset();
        setSelectedImages([]);
        setImagePreviews([]);
        setExistingImages([]);
        setSelectedFacilities([]);
      }

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft.");
    } finally {
      setDraftLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Append facilities
      formData.append("facilities", JSON.stringify(selectedFacilities));

      // Append all new image files
      for (const file of selectedImages) {
        formData.append("images", file);
      }

      // Append existing image URLs for edit mode
      if (isEditMode) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }

      if (isEditMode && propertyId) {
        await updateListing(propertyId, formData);
        toast.success("Property listing updated successfully!");
        if (onSuccess) onSuccess();
      } else {
        await addListing(formData);
        toast.success("Property listing added successfully!");
        form.reset();
        setSelectedImages([]);
        setImagePreviews([]);
        setExistingImages([]);
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
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Left Column (col-span-2) */}
      <div className="lg:col-span-2 space-y-6">
        {/* About Properties Card */}
        <div className="bg-white p-6 md:p-7 rounded-3xl shadow-sm border border-gray-100/80 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">About Property</h3>
              <p className="text-xs text-gray-500 mt-0.5">Title, category, price, area, and room specs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Property Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Modern Villa in Tagaytay"
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-sm font-medium"
                defaultValue={initialData.title || ""}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Property Category
              </Label>
              <input type="hidden" name="type" value={type} />
              <Select
                value={type}
                onValueChange={(val) => setType(val)}
              >
                <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Houses">Houses</SelectItem>
                  <SelectItem value="Condos">Condos</SelectItem>
                  <SelectItem value="Apartments">Apartments</SelectItem>
                  <SelectItem value="Townhouses">Townhouses</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="space-y-1.5 relative">
              <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Base Price (₱)
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                  ₱
                </span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  className="pl-9 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-sm font-medium"
                  placeholder="25,500,000"
                  defaultValue={initialData.price || ""}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Floor Area
              </Label>
              <div className="relative">
                <Maximize className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="area"
                  name="area"
                  className="pl-10 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-sm font-medium"
                  placeholder="e.g. 350 sqm"
                  defaultValue={initialData.area || ""}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="space-y-1.5">
              <Label htmlFor="beds" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Bedrooms
              </Label>
              <div className="relative">
                <BedDouble className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="beds"
                  name="beds"
                  type="number"
                  min="0"
                  className="pl-10 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-sm font-medium"
                  defaultValue={initialData.beds || "0"}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="baths" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Bathrooms
              </Label>
              <div className="relative">
                <Bath className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="baths"
                  name="baths"
                  type="number"
                  min="0"
                  className="pl-10 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-sm font-medium"
                  defaultValue={initialData.baths || "0"}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Property Description
            </Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe key highlights, architectural features, and neighborhood info..."
              className="flex min-h-[110px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus-visible:outline-none focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
              defaultValue={initialData.description || ""}
            ></textarea>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white p-6 md:p-7 rounded-3xl shadow-sm border border-gray-100/80 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Location & Tag</h3>
              <p className="text-xs text-gray-500 mt-0.5">City, address, and promotional badge</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                City / Province
              </Label>
              <Input
                id="location"
                name="location"
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-sm font-medium"
                placeholder="e.g. Makati City, Metro Manila"
                defaultValue={initialData.location || ""}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Full Address
              </Label>
              <Input
                id="address"
                name="address"
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-sm font-medium"
                placeholder="e.g. 123 Ayala Ave, Makati"
                defaultValue={initialData.address || ""}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="tag" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Promo Tag / Badge
              </Label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="tag"
                  name="tag"
                  className="pl-10 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-sm font-medium"
                  placeholder="e.g. Featured, Hot Deal, New"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
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
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-6 text-sm font-bold rounded-2xl border border-gray-200/80 transition-all duration-200 cursor-pointer"
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading || draftLoading}
            className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 py-6 text-sm font-bold rounded-2xl transition-all duration-200 cursor-pointer shadow-xs"
          >
            {draftLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-amber-700" />
                Drafting...
              </>
            ) : (
              "Save as Draft"
            )}
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-sm font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            disabled={loading || draftLoading}
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
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/80 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ImagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Upload Images</h3>
              <p className="text-xs text-gray-500 mt-0.5">Up to {MAX_IMAGES} images · PNG, JPG</p>
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Main Upload Area */}
          {totalImageCount === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl overflow-hidden mb-4 relative group h-48 border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center transition-all duration-300"
            >
              <div className="flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  Click to upload images
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Select multiple files at once
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              {/* Primary image preview (first image) */}
              <div className="relative rounded-2xl overflow-hidden h-48 mb-3 group shadow-xs">
                <img
                  src={existingImages[0] || imagePreviews[0]}
                  alt="Primary preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                    Primary Photo
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex flex-wrap gap-2">
                {/* Existing Images */}
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative w-16 h-16 shrink-0 group">
                    <div
                      className="w-full h-full rounded-2xl border border-gray-200 bg-cover bg-center overflow-hidden relative shadow-xs"
                      style={{ backgroundImage: `url(${url})` }}
                    >
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[9px] font-bold text-center py-0.5 tracking-wider">
                          PRIMARY
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200 cursor-pointer z-20"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* New Image Previews */}
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative w-16 h-16 shrink-0 group">
                    <div
                      className="w-full h-full rounded-2xl border border-emerald-200 bg-cover bg-center ring-2 ring-emerald-100/60 overflow-hidden relative shadow-xs"
                      style={{ backgroundImage: `url(${preview})` }}
                    >
                      {index === 0 && existingImages.length === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[9px] font-bold text-center py-0.5 tracking-wider">
                          PRIMARY
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200 cursor-pointer z-20"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add More Button */}
                {totalImageCount < MAX_IMAGES && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center shrink-0 cursor-pointer hover:bg-blue-50/50 hover:border-blue-400 hover:text-blue-600 transition-colors text-gray-400 font-medium"
                  >
                    <span className="text-xl leading-none">+</span>
                    <span className="text-[9px] mt-0.5">{totalImageCount}/{MAX_IMAGES}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Facilities Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/80 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Facilities</h3>
              <p className="text-xs text-gray-500 mt-0.5">Select amenities & manage categories</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {facilitiesList.map((facility) => {
              const isSelected = selectedFacilities.includes(facility);
              return (
                <div
                  key={facility}
                  onClick={() => toggleFacility(facility)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer border select-none ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <span>{facility}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteCategory(facility, e)}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected
                        ? "hover:bg-blue-700 text-white/80 hover:text-white"
                        : "hover:bg-gray-200 text-gray-400 hover:text-red-600"
                    }`}
                    title={`Delete category ${facility}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {showAddCustom ? (
            <div className="mt-4 flex gap-2">
              <Input
                value={customFacility}
                onChange={(e) => setCustomFacility(e.target.value)}
                placeholder="Category name (e.g. Solar Panels)"
                className="rounded-xl border-gray-200 focus-visible:ring-blue-500 text-xs font-medium"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomFacility();
                  }
                }}
                autoFocus
              />
              <Button
                type="button"
                onClick={handleAddCustomFacility}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-4 cursor-pointer"
              >
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddCustom(false);
                  setCustomFacility("");
                }}
                className="rounded-xl text-gray-500 text-xs cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddCustom(true)}
              className="w-full mt-6 rounded-2xl border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 py-6 text-xs font-bold transition-all cursor-pointer"
            >
              + Add custom category
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
