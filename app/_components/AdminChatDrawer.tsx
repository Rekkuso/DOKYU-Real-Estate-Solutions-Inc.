"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Building2,
  Users,
  MessageSquareText,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePropertyChat } from "../_hooks/usePropertyChat";
import type { PropertyConversation } from "../_types/chat";
import { formatPrice } from "@/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminChatDrawer({
  isOpen,
  onClose,
}: AdminChatDrawerProps) {
  const router = useRouter();
  const {
    propertyGroups,
    loadingConversations: loading,
  } = usePropertyChat(true);

  const [viewMode, setViewMode] = useState<"property" | "customer">("property");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filtered by Property
  const filteredGroups = propertyGroups.filter(
    (g) =>
      g.listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.listing.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Flattened & Filtered by Customer
  const allConversations: PropertyConversation[] = propertyGroups.flatMap(
    (g) => g.conversations
  );

  const filteredCustomers = allConversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const buyerName = (c.user_profile?.display_name || "").toLowerCase();
    const propertyTitle = (c.listing?.title || "").toLowerCase();
    const propertyLocation = (c.listing?.location || "").toLowerCase();
    return (
      buyerName.includes(q) ||
      propertyTitle.includes(q) ||
      propertyLocation.includes(q) ||
      c.user_id.toLowerCase().includes(q)
    );
  });

  const handleSelectProperty = (listingId: number) => {
    onClose();
    router.push(`/admin?tab=support&listingId=${listingId}`);
  };

  const handleSelectCustomer = (listingId: number, convId: string) => {
    onClose();
    router.push(`/admin?tab=support&listingId=${listingId}&convId=${convId}`);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs sm:hidden pointer-events-auto"
          />

          {/* Floating Admin Chat Tab Widget - Hanging Directly from Top Header Chat Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.1, y: -30, x: 20, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.1, y: -30, x: 20, filter: "blur(12px)" }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            style={{ transformOrigin: "top right" }}
            className="fixed top-20 right-3 sm:right-6 md:right-10 z-[9999] w-[95vw] sm:w-[480px] md:w-[500px] h-[680px] max-h-[82vh] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-slate-200/90 pointer-events-auto z-10 origin-top-right"
          >
            {/* Minimalist Light Blue Gradient Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-between shadow-xs shrink-0 relative border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs border border-white/30">
                  <MessageSquareText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-white leading-tight flex items-center gap-2">
                    Live Support Console
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
                    </span>
                  </h2>
                  <p className="text-[11px] text-blue-100/90 font-medium">
                    Admin Support Hub
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </motion.button>
            </div>

            {/* Controls: View Switcher & Search Bar */}
            <div className="p-3.5 border-b border-slate-200/80 space-y-3 bg-white shadow-2xs shrink-0">
              <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setViewMode("property")}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "property"
                      ? "bg-white text-blue-600 shadow-sm font-extrabold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  By Property ({propertyGroups.length})
                </button>
                <button
                  onClick={() => setViewMode("customer")}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "customer"
                      ? "bg-white text-blue-600 shadow-sm font-extrabold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  By Customer ({allConversations.length})
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search properties or location..."
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-100/90 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-slate-50/80">
              {loading ? (
                /* Skeleton Loader for Admin Drawer List */
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex items-center gap-3"
                    >
                      <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <Skeleton className="h-3.5 w-2/3 rounded-md" />
                        <Skeleton className="h-3 w-1/3 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : viewMode === "property" ? (
                /* By Property List */
                filteredGroups.length === 0 ? (
                  <div className="text-center p-12 text-slate-400 text-xs font-semibold">
                    No property inquiries found.
                  </div>
                ) : (
                  filteredGroups.map((group, idx) => (
                    <motion.div
                      key={group.listing.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleSelectProperty(group.listing.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 overflow-hidden shrink-0 relative border border-slate-200 shadow-inner flex items-center justify-center">
                          {group.listing.images?.[0] ? (
                            <img
                              src={group.listing.images[0]}
                              alt={group.listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate">
                            {group.listing.title}
                          </h4>
                          <p className="text-[11px] font-black text-blue-600 mt-0.5">
                            {formatPrice(group.listing.price)}
                          </p>
                        </div>
                        {group.totalUnread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30">
                            {group.totalUnread}
                          </span>
                        )}
                      </div>

                      {/* Sub-list of Buyers */}
                      {group.conversations.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                          {group.conversations.map((conv) => {
                            const buyerName =
                              conv.user_profile?.display_name ||
                              `User ${conv.user_id.substring(0, 6)}`;
                            return (
                              <motion.div
                                key={conv.id}
                                whileHover={{ scale: 1.01, x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCustomer(group.listing.id, conv.id);
                                }}
                                className="w-full p-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs hover:shadow-md transition-all"
                              >
                                <span className="truncate flex items-center gap-1.5 text-[11px]">
                                  <UserCheck className="h-3 w-3 shrink-0 text-blue-200" />
                                  {buyerName}
                                </span>
                                <div className="flex items-center gap-1">
                                  {conv.unread_admin > 0 && (
                                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                                      {conv.unread_admin}
                                    </span>
                                  )}
                                  <ChevronRight className="h-3.5 w-3.5 text-blue-200" />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  ))
                )
              ) : (
                /* By Customer List */
                filteredCustomers.length === 0 ? (
                  <div className="text-center p-12 text-slate-400 text-xs font-semibold">
                    No customer inquiries found.
                  </div>
                ) : (
                  filteredCustomers.map((conv, idx) => {
                    const buyerName =
                      conv.user_profile?.display_name ||
                      `User ${conv.user_id.substring(0, 6)}`;
                    return (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleSelectCustomer(conv.listing_id, conv.id)
                        }
                        className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {buyerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-slate-900 truncate">
                              {buyerName}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-semibold">
                              {conv.listing?.title || "Property Inquiry"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {conv.unread_admin > 0 && (
                            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30">
                              {conv.unread_admin}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </motion.div>
                    );
                  })
                )
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
