"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <MailCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Check your email</h2>
          <p className="text-gray-500">
            We sent a password reset link to <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 space-y-2">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
        <h2 className="text-3xl font-bold text-gray-900">Reset password</h2>
        <p className="text-gray-500">Enter your email address and we&apos;ll send you a link to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Sending link...
            </span>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ForgotPasswordPage() {
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
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
