"use client";

import React, { useState } from "react";
import {
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Users,
} from "lucide-react";
import Image from "next/image";
import { banUser, unbanUser, deleteUser } from "../_actions/users";
import type { UserProfile } from "../_actions/users";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface UserManagementTableProps {
  users: UserProfile[];
  totalUsers: number;
  loading: boolean;
  currentUserId: string;
  onRefresh: () => void;
}

export default function UserManagementTable({
  users,
  totalUsers,
  loading,
  currentUserId,
  onRefresh,
}: UserManagementTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 50;
  const [banTarget, setBanTarget] = useState<UserProfile | null>(null);
  const [banOpen, setBanOpen] = useState(false);
  const [banning, setBanning] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleBan = async () => {
    if (!banTarget) return;
    setBanning(true);
    try {
      if (banTarget.is_banned) {
        await unbanUser(banTarget.id);
        setSuccessMessage(`${banTarget.email} has been unbanned.`);
      } else {
        await banUser(banTarget.id);
        setSuccessMessage(`${banTarget.email} has been banned.`);
      }
      setBanOpen(false);
      setSuccessOpen(true);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status.");
    } finally {
      setBanning(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingUser(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteOpen(false);
      setSuccessMessage(`${deleteTarget.email} has been permanently deleted.`);
      setSuccessOpen(true);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user.");
    } finally {
      setDeletingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-4 border-b border-gray-50"
            >
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by email, name, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No users found
          </h3>
          <p className="text-gray-500 text-sm">
            {search ? "Try a different search term." : "No registered users yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_120px_100px_140px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>User</span>
            <span>Role</span>
            <span>Joined</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          {filtered.map((user) => {
            const isSelf = user.id === currentUserId;
            const initial =
              user.display_name?.charAt(0).toUpperCase() ||
              user.email.charAt(0).toUpperCase();
            const joinDate = new Date(user.created_at).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            );

            return (
              <div
                key={user.id}
                className={`grid grid-cols-1 sm:grid-cols-[1fr_120px_120px_100px_140px] gap-2 sm:gap-4 px-5 py-4 border-b border-gray-50 items-center hover:bg-gray-50/50 transition-colors ${
                  user.is_banned ? "opacity-60" : ""
                }`}
              >
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.email}
                      width={40}
                      height={40}
                      className="rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {initial}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.display_name || user.email}
                    </p>
                    {user.display_name && (
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Role */}
                <div>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {user.role === "admin" ? "Admin" : "User"}
                  </span>
                </div>

                {/* Joined */}
                <div className="text-sm text-gray-500">{joinDate}</div>

                {/* Status */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.is_banned
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.is_banned ? "bg-red-500" : "bg-emerald-500"
                      }`}
                    />
                    {user.is_banned ? "Banned" : "Active"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 justify-end">
                  {!isSelf && (
                    <>
                      <button
                        onClick={() => {
                          setBanTarget(user);
                          setBanOpen(true);
                        }}
                        title={user.is_banned ? "Unban" : "Ban"}
                        className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                          user.is_banned
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        }`}
                      >
                        {user.is_banned ? (
                          <Shield className="h-4 w-4" />
                        ) : (
                          <ShieldOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(user);
                          setDeleteOpen(true);
                        }}
                        title="Delete user"
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {isSelf && (
                    <span className="text-xs text-gray-400 italic">You</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filtered.length}</span> of <span className="font-medium">{totalUsers}</span> users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => {
                 setPage(p => Math.max(1, p - 1));
                 // Ideal implementation would fetch the next page here
                 // For now we just mock the UI change
                 toast.info("Server pagination requires fetch call implementation");
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filtered.length < perPage}
              onClick={() => {
                 setPage(p => p + 1);
                 toast.info("Server pagination requires fetch call implementation");
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Ban/Unban Confirmation */}
      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div
              className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${
                banTarget?.is_banned ? "bg-emerald-100" : "bg-amber-100"
              }`}
            >
              {banTarget?.is_banned ? (
                <Shield className="h-6 w-6 text-emerald-600" />
              ) : (
                <ShieldOff className="h-6 w-6 text-amber-600" />
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {banTarget?.is_banned ? "Unban User" : "Ban User"}
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-500">
              {banTarget?.is_banned ? (
                <>
                  Restore access for{" "}
                  <strong className="text-gray-900">{banTarget?.email}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to ban{" "}
                  <strong className="text-gray-900">{banTarget?.email}</strong>?
                  They will lose access to the platform.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setBanOpen(false)}
              disabled={banning}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 text-white ${
                banTarget?.is_banned
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
              onClick={handleToggleBan}
              disabled={banning}
            >
              {banning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : banTarget?.is_banned ? (
                "Yes, Unban"
              ) : (
                "Yes, Ban"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Delete User Permanently
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-500">
              This will permanently delete{" "}
              <strong className="text-gray-900">{deleteTarget?.email}</strong>{" "}
              and all associated data. This action <strong>cannot</strong> be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteOpen(false)}
              disabled={deletingUser}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deletingUser}
            >
              {deletingUser ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete Forever"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog
        open={successOpen}
        onOpenChange={(open) => {
          if (!open) setSuccessOpen(false);
        }}
      >
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Success
            </DialogTitle>
            <DialogDescription className="pt-2">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setSuccessOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
