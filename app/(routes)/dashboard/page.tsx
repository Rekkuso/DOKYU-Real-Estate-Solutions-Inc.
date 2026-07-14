"use client";

import React from "react";
import { useAuthContext } from "../../_context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UserDashboard from "../../_components/UserDashboard";

export default function DashboardPage() {
  const { user, isSignedIn, isLoading: authLoading, signOut } = useAuthContext();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-4 pt-28 pb-12">
          <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="font-bold text-2xl mb-2 text-gray-900">Sign in required</h2>
            <p className="text-gray-500 mb-6">
              Please sign in to view your dashboard.
            </p>
            <Link href="/sign-in?redirect=/dashboard">
              <Button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/30 cursor-pointer">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <UserDashboard user={user} onSignOut={handleSignOut} />;
}
