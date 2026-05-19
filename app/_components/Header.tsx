"use client";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

function Header() {
  const path = usePathname();
  const { user, isSignedIn } = useUser();
  useEffect(() => {
    console.log(path);
  }, []);
  return (
    <div className="p-5 px-10 flex justify-between items-center shadow-sm fixed top-0 w-full z-10  bg-white">
      <div className="flex gap-10 items-center">
        <img src="/companyLogo.svg" width={150} height={150} alt="logo" />
        <ul className="hidden md:flex gap-10">
          <Link href="/">
            <li
              className={`hover:text-primary hover:scale-110 font-semibold text-gray-600 transition-all duration-200 cursor-pointer ${
                path === "/" && "text-primary scale-110 font-bold"
              }`}
            >
              For Sale
            </li>
          </Link>
          <Link href="/">
            <li
              className={`hover:text-primary hover:scale-110 font-semibold text-gray-600 transition-all duration-200 cursor-pointer ${
                path === "/services" && "text-primary"
              }`}
            >
              Services
            </li>
          </Link>
          <Link href="/">
            <li className="hover:text-primary hover:scale-110 font-semibold text-gray-600 transition-all duration-200  cursor-pointer">
              About Us
            </li>
          </Link>
        </ul>
      </div>
      <div className="flex gap-2 items-center">
        <Button className="hover:scale-105 hover:text-white hover:bg-blue-900 text-white flex gap-2">
          <Plus className="h-5 w-5" />
          Post Your Add
        </Button>
        {isSignedIn ? (
          <UserButton />
        ) : (
          <>
            <Button
              className="hover:text-black hover:bg-amber-300 hover:scale-105 font-semibold text-gray-600 transition-all duration-200 cursor-pointer"
              variant="outline"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button className="hover:scale-105 hover:bg-blue-950 text-white flex gap-2">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
