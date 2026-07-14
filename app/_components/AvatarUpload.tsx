"use client";

import React, { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { uploadAvatar, updateProfile } from "../_actions/profile";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentUrl: string | null;
  fallbackInitial: string;
  onUploadSuccess: (newUrl: string | null) => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-12 h-12 text-lg",
  md: "w-20 h-20 text-3xl",
  lg: "w-28 h-28 text-4xl",
};

const overlaySizes = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

export default function AvatarUpload({
  currentUrl,
  fallbackInitial,
  onUploadSuccess,
  size = "lg",
}: AvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadAvatar(formData);
      onUploadSuccess(result.avatarUrl);
      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUrl && !previewUrl) return;
    
    setUploading(true);
    try {
      await updateProfile({ avatar_url: null });
      setPreviewUrl(null);
      onUploadSuccess(null);
      toast.success("Profile picture removed!");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove avatar.");
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden flex items-center justify-center font-bold shadow-xl shadow-blue-500/20 cursor-pointer transition-all duration-300 hover:shadow-blue-500/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2`}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
            {fallbackInitial}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
          {uploading ? (
            <Loader2 className={`${overlaySizes[size]} text-white animate-spin`} />
          ) : (
            <Camera className={`${overlaySizes[size]} text-white`} />
          )}
        </div>
      </button>

      {displayUrl && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={uploading}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors z-10 cursor-pointer"
          title="Remove photo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
