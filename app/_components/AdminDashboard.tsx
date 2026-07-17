"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  FileText,
  Heart,
  Users,
  TrendingUp,
  Home,
  Loader2,
  LogOut,
  ChevronRight,
  Menu,
  X,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Mail,
  Shield,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../_context/AuthContext";
import { getProfile, updateProfile } from "../_actions/profile";
import { getDraftListings } from "../_actions/listing";
import { getLikedListings, toggleLike } from "../_actions/likes";
import { getAllUsers } from "../_actions/users";
import type { UserProfile } from "../_actions/users";
import AvatarUpload from "./AvatarUpload";
import LikesTab from "./LikesTab";
import DraftListings from "./DraftListings";
import UserManagementTable from "./UserManagementTable";
import Footer from "./Footer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Tab = "overview" | "drafts" | "likes" | "users";

interface ProfileData {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  avatar_url: string | null;
  is_banned: boolean;
  created_at: string;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "likes", label: "Likes", icon: Heart },
  { id: "users", label: "Users", icon: Users },
];

function formatPrice(price: number) {
  if (price >= 1000000) return `₱${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `₱${(price / 1000).toFixed(0)}K`;
  return `₱${price.toLocaleString()}`;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(true);
  const [likedListings, setLikedListings] = useState<any[]>([]);
  const [likesLoading, setLikesLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Editing display name
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrafts: 0,
    totalLikes: 0,
  });

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      if (data?.display_name) setNameInput(data.display_name);
    } catch {
      console.error("Failed to fetch profile");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchDrafts = useCallback(async () => {
    setDraftsLoading(true);
    try {
      const data = await getDraftListings();
      setDrafts(data);
    } catch {
      console.error("Failed to fetch drafts");
    } finally {
      setDraftsLoading(false);
    }
  }, []);

  const fetchLikes = useCallback(async () => {
    setLikesLoading(true);
    try {
      const data = await getLikedListings();
      setLikedListings(data);
    } catch {
      console.error("Failed to fetch likes");
    } finally {
      setLikesLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchDrafts();
    fetchLikes();
    fetchUsers();
  }, [fetchProfile, fetchDrafts, fetchLikes, fetchUsers]);

  useEffect(() => {
    setStats({
      totalUsers: users.length,
      totalDrafts: drafts.length,
      totalLikes: likedListings.length,
    });
  }, [users, drafts, likedListings]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await updateProfile({ display_name: nameInput.trim() });
      setProfile((p) => (p ? { ...p, display_name: nameInput.trim() } : p));
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: { display_name: nameInput.trim() } }));
      setEditingName(false);
      toast.success("Display name updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarUpload = (newUrl: string) => {
    setProfile((p) => (p ? { ...p, avatar_url: newUrl } : p));
  };

  const handleUnlike = async (listingId: number) => {
    try {
      await toggleLike(listingId);
      setLikedListings((prev) => prev.filter((l) => l.id !== listingId));
      toast.success("Removed from likes.");
    } catch (error: any) {
      toast.error(error.message || "Failed to unlike.");
    }
  };

  const userInitial =
    profile?.display_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "A";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero section */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-blue-950 to-indigo-950" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link
              href="/"
              className="hover:text-white transition-colors duration-200"
            >
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">Admin Dashboard</span>
          </nav>

          <div className="flex items-center gap-6">
            {profileLoading ? (
              <Skeleton className="w-20 h-20 rounded-2xl" />
            ) : (
              <AvatarUpload
                currentUrl={profile?.avatar_url || null}
                fallbackInitial={userInitial}
                size="lg"
                onUploadSuccess={(url) => {
                  setProfile((p) => (p ? { ...p, avatar_url: url } : p));
                  window.dispatchEvent(new CustomEvent("profileUpdated", { detail: { avatar_url: url } }));
                }}
              />
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Admin Dashboard
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {profileLoading ? (
                  <Skeleton className="h-5 w-48" />
                ) : editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Display name"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") setEditingName(false);
                      }}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {savingName ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="px-3 py-1 rounded-lg bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setNameInput(profile?.display_name || "");
                      setEditingName(true);
                    }}
                    className="text-white/60 text-lg hover:text-white/80 transition-colors cursor-pointer"
                  >
                    {profile?.display_name || "Click to set display name"}
                  </button>
                )}
              </div>
              <p className="text-white/40 text-sm mt-1">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile tab toggle */}
      <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          {tabs.find((t) => t.id === activeTab)?.label}
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "block" : "hidden"
            } lg:block w-full lg:w-64 shrink-0 ${
              sidebarOpen
                ? "fixed inset-0 top-[calc(4rem+52px)] z-20 bg-white p-4 overflow-y-auto lg:relative lg:inset-auto lg:top-auto lg:bg-transparent lg:p-0"
                : ""
            }`}
          >
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden sticky top-32">
              <div className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {tab.label}
                      {tab.id === "drafts" && stats.totalDrafts > 0 && (
                        <span
                          className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {stats.totalDrafts}
                        </span>
                      )}
                      {tab.id === "users" && stats.totalUsers > 0 && (
                        <span
                          className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {stats.totalUsers}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick links */}
              <div className="border-t border-gray-100 p-2">
                <Link
                  href="/properties"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                >
                  <LayoutDashboard className="h-4.5 w-4.5" />
                  View Properties
                </Link>
                <Link
                  href="/add-new-listing"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                >
                  <Home className="h-4.5 w-4.5" />
                  Add New Listing
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {activeTab === "overview" && (
              <OverviewTab
                stats={stats}
                usersLoading={usersLoading}
                draftsLoading={draftsLoading}
                likesLoading={likesLoading}
                user={user}
                profile={profile}
              />
            )}
            {activeTab === "drafts" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Drafts</h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                      Manage unpublished listings
                    </p>
                  </div>
                  <Link href="/add-new-listing">
                    <Button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/25 cursor-pointer">
                      New Listing
                    </Button>
                  </Link>
                </div>
                <DraftListings
                  drafts={drafts}
                  loading={draftsLoading}
                  onRefresh={fetchDrafts}
                />
              </div>
            )}
            {activeTab === "likes" && (
              <LikesTab
                listings={likedListings}
                loading={likesLoading}
                onUnlike={handleUnlike}
              />
            )}
            {activeTab === "users" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Users</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Manage registered users
                  </p>
                </div>
                <UserManagementTable
                  users={users}
                  loading={usersLoading}
                  currentUserId={user?.id || ""}
                  onRefresh={fetchUsers}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function OverviewTab({
  stats,
  usersLoading,
  draftsLoading,
  likesLoading,
  user,
  profile,
}: {
  stats: { totalUsers: number; totalDrafts: number; totalLikes: number };
  usersLoading: boolean;
  draftsLoading: boolean;
  likesLoading: boolean;
  user: any;
  profile: any;
}) {
  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      loading: usersLoading,
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/20",
    },
    {
      label: "Draft Listings",
      value: stats.totalDrafts,
      loading: draftsLoading,
      icon: FileText,
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
    },
    {
      label: "Liked Properties",
      value: stats.totalLikes,
      loading: likesLoading,
      icon: Heart,
      gradient: "from-rose-500 to-pink-600",
      shadow: "shadow-rose-500/20",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Quick glance at your platform
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-md hover:shadow-lg transition-shadow duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-linear-to-br ${card.gradient} ${card.shadow} shadow-lg flex items-center justify-center`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              {card.loading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <p className="text-3xl font-extrabold text-gray-900">
                  {card.value}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>

              {/* Decorative corner */}
              <div
                className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-linear-to-br ${card.gradient} opacity-5`}
              />
            </div>
          );
        })}
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col mt-6">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Profile Information
          </h2>
        </div>
        <div className="p-6 space-y-5 flex-1">
          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-0.5">Email Address</p>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-0.5">Account Role</p>
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                  Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Joined Date */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-0.5">Member Since</p>
              <p className="text-gray-900 font-medium">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown"}
              </p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-400 mb-0.5">User ID</p>
              <p className="text-gray-500 font-mono text-xs break-all">
                {user?.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


