"use client";

import React from "react";
import {
  Users,
  FileText,
  Heart,
  TrendingUp,
  User,
  Mail,
  Shield,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminOverviewTabProps {
  stats: { totalUsers: number; totalDrafts: number; totalLikes: number };
  usersLoading: boolean;
  draftsLoading: boolean;
  likesLoading: boolean;
  user: any;
  profile: any;
}

export default function AdminOverviewTab({
  stats,
  usersLoading,
  draftsLoading,
  likesLoading,
  user,
  profile,
}: AdminOverviewTabProps) {
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
              className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-md hover:shadow-lg transition-shadow duration-300"
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
