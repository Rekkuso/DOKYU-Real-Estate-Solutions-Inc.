"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { getProfile } from "../_actions/profile";

interface AuthContextValue {
  user: User | null;
  isSignedIn: boolean;
  isLoading: boolean;
  profileDisplayName: string | null;
  profileAvatarUrl: string | null;
  updateProfileData: (updates: { display_name?: string | null; avatar_url?: string | null }) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isSignedIn: false,
  isLoading: true,
  profileDisplayName: null,
  profileAvatarUrl: null,
  updateProfileData: () => {},
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      if (data) {
        setProfileDisplayName(data.display_name ?? null);
        setProfileAvatarUrl(data.avatar_url ?? null);
      }
    } catch {
      // Ignore transient dev server / auth session errors
    }
  }, []);

  const updateProfileData = useCallback((updates: { display_name?: string | null; avatar_url?: string | null }) => {
    if (updates.display_name !== undefined) {
      setProfileDisplayName(updates.display_name);
    }
    if (updates.avatar_url !== undefined) {
      setProfileAvatarUrl(updates.avatar_url);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Get the initial session
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error && !error.message.includes("Auth session missing")) {
        console.error("AuthContext getUser error:", error);
      }
      setUser(user ?? null);
      setIsLoading(false);
      if (user) {
        fetchProfile();
      }
    }).catch((err) => {
      console.error("AuthContext getUser promise error:", err);
      setIsLoading(false);
    });

    // Listen for auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        fetchProfile();
      } else {
        setProfileDisplayName(null);
        setProfileAvatarUrl(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfileDisplayName(null);
    setProfileAvatarUrl(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: !!user,
        isLoading,
        profileDisplayName,
        profileAvatarUrl,
        updateProfileData,
        refreshProfile: fetchProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}

