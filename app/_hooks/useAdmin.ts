"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "../_context/AuthContext";
import { getIsAdmin } from "../_actions/admin";
import { useAdminContext } from "../_context/AdminContext";

/**
 * Client-side hook that checks whether the current user is an admin.
 * Calls the getIsAdmin() server action on mount whenever the user changes.
 */
export function useAdmin() {
  const { user } = useAuthContext();
  const contextAdmin = useAdminContext();
  const [isAdmin, setIsAdmin] = useState(contextAdmin.isAdmin);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function checkAdminStatus() {
      if (!user) {
        if (mounted) {
          setIsAdmin(false);
          setIsLoading(false);
        }
        return;
      }
      try {
        const adminStatus = await getIsAdmin();
        if (mounted) setIsAdmin(adminStatus);
      } catch {
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    checkAdminStatus();
    return () => {
      mounted = false;
    };
  }, [user]);

  return { isAdmin, isLoading };
}
