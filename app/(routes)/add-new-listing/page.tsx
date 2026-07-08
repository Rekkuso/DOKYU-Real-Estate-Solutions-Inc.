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
import { addListing } from "../../_actions/listing";
import { Loader2 } from "lucide-react";

function AddNewListing() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await addListing(formData);
      
      toast.success("Property List Added Successfully!");
      e.currentTarget.reset(); // clear the form back to empty state
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-28 pb-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl">
          <h2 className="font-bold text-3xl mb-2 text-gray-900">Add New Listing</h2>
          <p className="text-gray-500 mb-8">Enter the property details below to add it to the database.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title</Label>
                <Input id="title" name="title" placeholder="e.g. Modern Luxury Villa" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <Select name="type" required defaultValue="Houses">
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
                <Input id="location" name="location" placeholder="e.g. Makati City, Metro Manila" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" name="address" placeholder="e.g. 123 Ayala Ave, Makati" required />
              </div>
            </div>

            {/* Price & Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₱)</Label>
                <Input id="price" name="price" type="number" min="0" placeholder="e.g. 25500000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Floor Area (sqm)</Label>
                <Input id="area" name="area" placeholder="e.g. 350 sqm" required />
              </div>
            </div>

            {/* Beds, Baths, Tag */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="beds">Bedrooms</Label>
                <Input id="beds" name="beds" type="number" min="0" defaultValue="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baths">Bathrooms</Label>
                <Input id="baths" name="baths" type="number" min="0" defaultValue="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">Tag</Label>
                <Input id="tag" name="tag" placeholder="e.g. Featured, New" />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Property Listing"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddNewListing;
