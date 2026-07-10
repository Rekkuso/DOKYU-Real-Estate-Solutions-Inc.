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
  const { isAdmin, isLoading } = useAdminContext();
  return { isAdmin, isLoading };
}
