"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { getProfile, updateProfile } from "../_actions/profile";
import { toggleLike, getLikedListings } from "../_actions/likes";
import AvatarUpload from "./AvatarUpload";
import LikesTab from "./LikesTab";
import Footer from "./Footer";
import {
  User,
  Heart,
  Settings,
  Mail,
  Calendar,
  LogOut,
  Home,
  Shield,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserDashboard({
  user,
  onSignOut,
}: {
  user: SupabaseUser;
  onSignOut: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit Profile State
  const [nameInput, setNameInput] = useState("");
  const [ageInput, setAgeInput] = useState<string>("");
  const [phoneInput, setPhoneInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Likes State
  const [likedListings, setLikedListings] = useState<any[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(true);

  // Fetch initial data
  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const [profData, likesData] = await Promise.all([
          getProfile(),
          getLikedListings(),
        ]);
        
        if (mounted) {
          setProfile(profData);
          setNameInput(profData?.display_name || "");
          setAgeInput(profData?.age?.toString() || "");
          setPhoneInput(profData?.phone_number || "");
          setLoadingProfile(false);
          
          setLikedListings(likesData);
          setLoadingLikes(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (mounted) {
          setLoadingProfile(false);
          setLoadingLikes(false);
        }
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUnlike = async (listingId: number) => {
    const { liked } = await toggleLike(listingId);
    if (!liked) {
      setLikedListings((prev) => prev.filter((l) => l.id !== listingId));
      toast.success("Property removed from likes");
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updates = {
        display_name: nameInput.trim() || undefined,
        age: ageInput ? parseInt(ageInput, 10) : null,
        phone_number: phoneInput.trim() || null,
      };
      
      await updateProfile(updates);
      setProfile((p: any) => (p ? { ...p, ...updates } : p));
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: updates }));
      toast.success("Profile updated successfully!");
      setActiveTab("overview");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const userInitial = profile?.display_name
    ? profile.display_name.charAt(0).toUpperCase()
    : "U";

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-blue-950 to-indigo-950" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
              <Link href="/" className="hover:text-white transition-colors duration-200">
                Home
              </Link>
              <span>/</span>
              <span className="text-white/90">Dashboard</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              My Dashboard
            </h1>
            <p className="text-white/60 text-lg mt-1">
              Manage your account, preferences, and saved properties
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 flex flex-col items-center border-b border-gray-100">
              {loadingProfile ? (
                <>
                  <Skeleton className="w-28 h-28 rounded-2xl" />
                  <Skeleton className="h-6 w-32 mt-4" />
                  <Skeleton className="h-4 w-48 mt-2" />
                </>
              ) : (
                <>
                  <AvatarUpload
                    currentUrl={profile?.avatar_url}
                    fallbackInitial={userInitial}
                    size="lg"
                    onUploadSuccess={(url) => {
                      setProfile((p: any) => (p ? { ...p, avatar_url: url } : p));
                      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: { avatar_url: url } }));
                    }}
                  />
                  <h2 className="mt-4 font-bold text-gray-900 text-lg text-center truncate w-full">
                    {profile?.display_name || `User ${user.id.substring(0, 8)}`}
                  </h2>
                  <p className="text-gray-500 text-sm truncate w-full text-center">
                    {user.email}
                  </p>
                </>
              )}
            </div>

            <nav className="p-3 space-y-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <User className={`h-4.5 w-4.5 ${activeTab === "overview" ? "text-blue-600" : "text-gray-400"}`} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("edit-profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium cursor-pointer ${
                  activeTab === "edit-profile"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Settings className={`h-4.5 w-4.5 ${activeTab === "edit-profile" ? "text-blue-600" : "text-gray-400"}`} />
                Edit Profile
              </button>
              <button
                onClick={() => setActiveTab("likes")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium cursor-pointer ${
                  activeTab === "likes"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className={`h-4.5 w-4.5 ${activeTab === "likes" ? "text-blue-600 fill-blue-100" : "text-gray-400"}`} />
                  Likes
                </div>
                {!loadingLikes && likedListings.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === "likes" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {likedListings.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Quick Action Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Action</h3>
            </div>
            <div className="p-3">
              <Link href="/properties" className="block">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                  <Home className="h-4.5 w-4.5" />
                  <span className="text-sm font-medium">Browse Properties</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-3">
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Profile Information
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {loadingProfile ? (
                  <div className="space-y-5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-4">
                        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                        <div className="space-y-2 pt-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-0.5">Email Address</p>
                        <p className="text-gray-900 font-medium">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-0.5">Member Since</p>
                        <p className="text-gray-900 font-medium">{createdAt}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-0.5">Display Name</p>
                        <p className="text-gray-900 font-medium">
                          {profile?.display_name || "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                        <Settings className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-0.5">Age</p>
                        <p className="text-gray-900 font-medium">
                          {profile?.age ? `${profile.age} years old` : "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-400 mb-0.5">User ID</p>
                        <p className="text-gray-500 font-mono text-xs break-all">
                          {user.id}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <Button 
                    onClick={() => setActiveTab("edit-profile")}
                    variant="outline"
                    className="border-gray-200 text-gray-700 cursor-pointer"
                  >
                    Edit Information
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === "edit-profile" && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Edit Profile Information
                </h2>
              </div>
              <div className="p-6">
                {loadingProfile ? (
                  <div className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <form 
                    className="space-y-6 max-w-lg mx-auto"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveProfile();
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-gray-700">Display Name</Label>
                      <Input
                        id="displayName"
                        placeholder="e.g. John Doe"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-gray-700">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="e.g. 30"
                        value={ageInput}
                        onChange={(e) => setAgeInput(e.target.value)}
                        className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g. +63 912 345 6789"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="pt-4 flex justify-center">
                      <Button
                        type="submit"
                        disabled={savingProfile}
                        className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-blue-500/20 px-10 cursor-pointer"
                      >
                        {savingProfile ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Likes Tab */}
          {activeTab === "likes" && (
            <LikesTab
              listings={likedListings}
              loading={loadingLikes}
              onUnlike={handleUnlike}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
