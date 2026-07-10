"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "../_context/AuthContext";
import { getIsAdmin } from "../_actions/admin";

/**
 * Client-side hook that checks whether the current user is an admin.
 * Calls the getIsAdmin() server action on mount whenever the user changes.
 */
export function useAdmin() {
  const { user, isLoading: authLoading } = useAuthContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getIsAdmin().then((result) => {
      if (!cancelled) {
        setIsAdmin(result);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isAdmin, isLoading };
}
