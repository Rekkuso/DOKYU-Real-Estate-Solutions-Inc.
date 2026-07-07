"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

function Header() {
  const path = usePathname();
  const { user, isSignedIn } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <img src="/companyLogo.svg" width={130} height={130} alt="DOKYU logo" />
        </Link>
        <ul className="hidden md:flex gap-8">
          {[
            { label: "For Sale", href: "/", matchPath: "/" },
            { label: "Services", href: "#services", matchPath: "/services" },
            { label: "About Us", href: "#cta", matchPath: "/about" },
          ].map((item) => (
            <Link key={item.label} href={item.href}>
              <li
                className={`hover:text-primary hover:scale-105 font-semibold transition-all duration-200 cursor-pointer ${
                  path === item.matchPath
                    ? "text-primary scale-105 font-bold"
                    : scrolled
                      ? "text-gray-600"
                      : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}
              </li>
            </Link>
          ))}
        </ul>
      </div>
      <div className="flex gap-2 items-center">
        <Link href="/add-new-listing">
          <Button className="hover:scale-105 hover:bg-blue-700 text-white flex gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 rounded-lg shadow-md shadow-blue-500/20 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Post Your Ad</span>
          </Button>
        </Link>
        {isSignedIn ? (
          <UserButton />
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
