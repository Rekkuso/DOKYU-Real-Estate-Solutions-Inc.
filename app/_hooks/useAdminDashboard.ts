"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../_context/AuthContext";
import { getProfile, updateProfile } from "../_actions/profile";
import { getDraftListings } from "../_actions/listing";
import { getLikedListings, toggleLike } from "../_actions/likes";
import { getAllUsers } from "../_actions/users";
import { getAdminDashboardData } from "../_actions/dashboard";
import type { UserProfile, ProfileData } from "../_types/user";
import { toast } from "sonner";

export function useAdminDashboard() {
  const { user, signOut, updateProfileData } = useAuthContext();
  const router = useRouter();

  // Data states
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(true);
  const [likedListings, setLikedListings] = useState<any[]>([]);
  const [likesLoading, setLikesLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
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

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setProfileLoading(true);
    setDraftsLoading(true);
    setLikesLoading(true);
    setUsersLoading(true);

    try {
      const data = await getAdminDashboardData();
      setProfile(data.profile as any);
      if (data.profile?.display_name) setNameInput(data.profile.display_name);

      setDrafts(data.drafts);
      setLikedListings(data.likes);
      setUsers(data.users);
      setTotalUsers(data.totalUsers);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setProfileLoading(false);
      setDraftsLoading(false);
      setLikesLoading(false);
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfile(data as any);
    } catch {
      console.error("Failed to fetch profile");
    }
  }, []);

  const fetchDrafts = useCallback(async () => {
    setDraftsLoading(true);
    try {
      const data = await getDraftListings();
      setDrafts(data);
      setStats((prev) => ({ ...prev, totalDrafts: data.length }));
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
      setStats((prev) => ({ ...prev, totalLikes: data.length }));
    } catch {
      console.error("Failed to fetch likes");
    } finally {
      setLikesLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await getAllUsers(1, 50);
      setUsers(data.users);
      setTotalUsers(data.total);
      setStats((prev) => ({ ...prev, totalUsers: data.total }));
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  }, []);

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
      updateProfileData({ display_name: nameInput.trim() });
      setEditingName(false);
      toast.success("Display name updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarUpload = (newUrl: string | null) => {
    setProfile((p) => (p ? { ...p, avatar_url: newUrl } : p));
    updateProfileData({ avatar_url: newUrl });
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

  return {
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
    loading,
    userInitial,
    fetchProfile,
    fetchDrafts,
    fetchLikes,
    fetchUsers,
    fetchDashboardData,
    handleSignOut,
    handleSaveName,
    handleAvatarUpload,
    handleUnlike,
  };
}
