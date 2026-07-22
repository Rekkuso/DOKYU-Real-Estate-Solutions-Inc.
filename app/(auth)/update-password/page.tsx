"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    toast.success("Password updated successfully");
    router.push("/properties"); // Redirect to dashboard/properties
    router.refresh();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center space-y-2">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LockKeyhole className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Set new password</h2>
        <p className="text-gray-500">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Updating...
            </span>
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <main className="w-full flex">
      {/* Decorative left panel — visible on large screens only */}
      <div
        className="relative flex-1 hidden items-center justify-center h-screen lg:flex bg-cover bg-center"
        style={{ backgroundImage: "url(/backgroundPhoto.webp)" }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative pt-20 z-10 w-full max-w-md ">
          <img
            src="/companyLogo.svg"
            width={400}
            style={{ height: "auto" }}
            className="top-35 relative right-30"
            alt="Logo"
          />
          <div className="top-40 right-23 relative space-y-3">
            <h3 className="text-white text-3xl font-bold">
              Properties That Suits You.
            </h3>
            <p className="text-gray-300">
              Create an account and get access to all properties.
            </p>
            <div className="flex items-center -space-x-2">
              <img
                src="https://randomuser.me/api/portraits/women/79.jpg"
                className="w-10 h-10 rounded-full border-2 border-white"
                alt=""
              />
              <img
                src="https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg"
                className="w-10 h-10 rounded-full border-2 border-white"
                alt=""
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=a72ca28288878f8404a795f39642a46f"
                className="w-10 h-10 rounded-full border-2 border-white"
                alt=""
              />
              <img
                src="https://randomuser.me/api/portraits/men/86.jpg"
                className="w-10 h-10 rounded-full border-2 border-white"
                alt=""
              />
              <img
                src="https://images.unsplash.com/photo-1510227272981-87123e259b17?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=3759e09a5b9fbe53088b23c615b6312e"
                className="w-10 h-10 rounded-full border-2 border-white"
                alt=""
              />
              <p className="text-sm text-gray-400 font-medium translate-x-5">
                Join our community.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center h-screen px-6">
        <UpdatePasswordForm />
      </div>
    </main>
  );
}
