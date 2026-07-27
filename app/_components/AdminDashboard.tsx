"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Heart,
  Users,
  Home,
  LogOut,
  ChevronRight,
  Menu,
  X,
  MessageSquareText,
} from "lucide-react";
import Link from "next/link";
import AvatarUpload from "./AvatarUpload";
import LikesTab from "./LikesTab";
import DraftListings from "./DraftListings";
import UserManagementTable from "./UserManagementTable";
import AdminOverviewTab from "./AdminOverviewTab";
import AdminChatInbox from "./AdminChatInbox";
import Footer from "./Footer";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboard } from "../_hooks/useAdminDashboard";

type Tab = "overview" | "support" | "drafts" | "likes" | "users";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "support", label: "Live Support", icon: MessageSquareText },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "likes", label: "Likes", icon: Heart },
  { id: "users", label: "Users", icon: Users },
];

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || "overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (tabParam && ["overview", "support", "drafts", "likes", "users"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const {
    user,
    profile,
    profileLoading,
    drafts,
    draftsLoading,
    likedListings,
    likesLoading,
    users,
    totalUsers,
    usersLoading,
    editingName,
    setEditingName,
    nameInput,
    setNameInput,
    savingName,
    stats,
    userInitial,
    fetchDrafts,
    fetchUsers,
    handleSignOut,
    handleSaveName,
    handleAvatarUpload,
    handleUnlike,
  } = useAdminDashboard();

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
                onUploadSuccess={handleAvatarUpload}
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
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {savingName ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="px-2 py-1 text-white/60 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-white/70 text-sm">
                      Welcome back,{" "}
                      <span className="font-semibold text-white">
                        {profile?.display_name || user?.email}
                      </span>
                    </p>
                    <button
                      onClick={() => {
                        setNameInput(profile?.display_name || "");
                        setEditingName(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                )}
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content grid */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="font-semibold text-gray-700 capitalize">
            {activeTab}
          </span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`w-full md:w-64 shrink-0 space-y-6 ${
            sidebarOpen ? "block" : "hidden md:block"
          }`}
        >
          {/* Navigation Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Management
              </h3>
            </div>
            <nav className="p-3 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                let count: number | null = null;
                if (tab.id === "drafts") count = drafts.length;
                if (tab.id === "likes") count = likedListings.length;
                if (tab.id === "users") count = users.length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium cursor-pointer ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-xs"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4.5 w-4.5 ${
                          isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      <span>{tab.label}</span>
                    </div>

                    {count !== null && count > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Quick Actions
              </h3>
            </div>
            <div className="p-3 space-y-1">
              <Link href="/add-new-listing" className="block">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                  <Home className="h-4.5 w-4.5" />
                  <span className="text-sm font-medium">Post New Property</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Sign Out Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-3">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === "overview" && (
            <AdminOverviewTab
              stats={stats}
              usersLoading={usersLoading}
              draftsLoading={draftsLoading}
              likesLoading={likesLoading}
              user={user}
              profile={profile}
            />
          )}

          {activeTab === "support" && <AdminChatInbox />}

          {activeTab === "drafts" && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Draft Listings</h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  Properties saved as drafts that are not yet visible to the public.
                </p>
              </div>
              <DraftListings
                drafts={drafts}
                loading={draftsLoading}
                onRefresh={fetchDrafts}
              />
            </div>
          )}

          {activeTab === "likes" && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <LikesTab
                listings={likedListings}
                loading={likesLoading}
                onUnlike={handleUnlike}
              />
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <UserManagementTable
                users={users}
                totalUsers={totalUsers}
                loading={usersLoading}
                currentUserId={user?.id || ""}
                onRefresh={fetchUsers}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
