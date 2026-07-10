"use client";

import React, { createContext, useContext } from "react";

interface AdminContextValue {
  isAdmin: boolean;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  isLoading: true,
});

export function AdminProvider({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isLoading: false,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return ctx;
}
