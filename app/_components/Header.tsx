"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { useAuthContext } from "../_context/AuthContext";

function Header({ isAdmin }: { isAdmin?: boolean }) {
  const path = usePathname();
  const {
    user,
    isSignedIn,
    isLoading: authLoading,
    signOut,
  } = useAuthContext();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger once on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    window.location.href = "/";
  };

  // Get user initials for the avatar
  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <div
      className={`p-4 px-6 md:px-10 flex justify-between items-center fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg shadow-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="flex gap-10 items-center">
        <Link href="/">
          <img
            src="/companyLogo.svg"
            width={130}
            height={130}
            alt="DOKYU logo"
          />
        </Link>
        <ul className="hidden md:flex gap-8">
          {[
            {
              label: "Properties Listings",
              href: "/properties",
            },
            { label: "Services", href: "/services" },
            { label: "About Us", href: "/about" },
          ].map((item) => {
            const isMatch = path === item.href;

            // Only use white text at the top if the page has a dark hero section
            const isDarkHeroPage =
              path === "/" ||
              path === "/properties" ||
              path === "/dashboard" ||
              path === "/about" ||
              path === "/services";
            const defaultColor =
              !scrolled && isDarkHeroPage ? "text-white/90" : "text-black";

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`inline-block font-semibold transition-all duration-200 cursor-pointer hover:scale-105 hover:text-blue-600 ${
                    isMatch ? "text-blue-600 scale-105" : defaultColor
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex gap-2 items-center">
        {isAdmin && (
          <Link href="/add-new-listing">
            <Button className="hover:scale-105 hover:bg-blue-700 text-white flex gap-2 bg-linear-to-r from-blue-600 to-indigo-600 border-0 rounded-lg shadow-md shadow-blue-500/20 cursor-pointer">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Post Property</span>
            </Button>
          </Link>
        )}
        {isSignedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:scale-105 transition-transform duration-200 cursor-pointer"
            >
              {userInitial}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                  {isAdmin && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                      Admin
                    </span>
                  )}
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  My Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/sign-up">
            <Button
              className={`hover:scale-105 flex gap-2 rounded-lg cursor-pointer transition-all duration-300 ${
                scrolled
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  : "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
              }`}
            >
              Sign Up
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
