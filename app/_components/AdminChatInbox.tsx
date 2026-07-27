"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  Search,
  Send,
  ExternalLink,
  MapPin,
  Loader2,
  MessageSquareText,
  UserCheck,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getAdminConversationsByProperty,
  sendChatMessage,
  markMessagesAsRead,
  getConversationMessages,
} from "../_actions/chat";
import type { AdminPropertyChatGroup, PropertyConversation, PropertyChatMessage } from "../_types/chat";
import { formatPrice } from "@/utils/format";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function AdminChatInbox() {
  const searchParams = useSearchParams();
  const targetListingId = searchParams.get("listingId");
  const targetConvId = searchParams.get("convId");

  const [viewMode, setViewMode] = useState<"property" | "customer">("property");
  const [propertyGroups, setPropertyGroups] = useState<AdminPropertyChatGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<AdminPropertyChatGroup | null>(null);
  const [activeConversation, setActiveConversation] = useState<PropertyConversation | null>(null);
  const [messages, setMessages] = useState<PropertyChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConvRef = useRef<PropertyConversation | null>(null);
  activeConvRef.current = activeConversation;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load all property groups
  const loadAdminChatData = async () => {
    try {
      const groups = await getAdminConversationsByProperty();
      setPropertyGroups(groups);

      let targetGroup: AdminPropertyChatGroup | undefined;
      let targetConv: PropertyConversation | undefined;

      if (targetListingId) {
        targetGroup = groups.find((g) => g.listing.id === Number(targetListingId));
      }

      if (!targetGroup && groups.length > 0) {
        targetGroup = groups[0];
      }

      if (targetGroup) {
        setSelectedGroup(targetGroup);
        if (targetConvId) {
          targetConv = targetGroup.conversations.find((c) => c.id === targetConvId);
        }
        if (!targetConv && targetGroup.conversations.length > 0) {
          targetConv = targetGroup.conversations[0];
        }
        if (targetConv) {
          selectConversation(targetConv);
        }
      }
    } catch (err) {
      console.error("Error loading admin chat groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: PropertyConversation) => {
    setActiveConversation(conv);
    setLoadingMessages(true);

    // Immediately zero-out unread badges in propertyGroups state
    setPropertyGroups((prevGroups) =>
      prevGroups.map((group) => {
        const updatedConvs = group.conversations.map((c) =>
          c.id === conv.id ? { ...c, unread_admin: 0 } : c
        );
        const totalUnread = updatedConvs.reduce(
          (acc, c) => acc + (c.unread_admin || 0),
          0
        );
        return {
          ...group,
          conversations: updatedConvs,
          totalUnread,
        };
      })
    );

    try {
      const msgs = await getConversationMessages(conv.id);
      setMessages(msgs);
      await markMessagesAsRead(conv.id, true);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendAdminMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!activeConversation || !text.trim()) return;

    setSending(true);
    try {
      const newMsg = await sendChatMessage(activeConversation.id, text, "admin");
      setMessages((prev) => [...prev, newMsg]);
      setInputMessage("");
      loadAdminChatData();
    } catch (err: any) {
      toast.error(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadAdminChatData();
  }, []);

  // Supabase Realtime Listener for Admin Inbox
  useEffect(() => {
    const supabase = createClient();
    const channelId = `admin_chat_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "property_chat_messages",
        },
        (payload) => {
          const newMsg = payload.new as PropertyChatMessage;
          const currentActive = activeConvRef.current;

          if (currentActive && newMsg.conversation_id === currentActive.id) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            markMessagesAsRead(currentActive.id, true);
          }

          loadAdminChatData();
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("Admin realtime subscription error:", err);
        } else {
          console.log(`Admin realtime channel [${channelId}] status:`, status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter property groups based on search query
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

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col md:flex-row h-[750px] min-w-0">
      {/* Left Sidebar Pane */}
      <div className="w-full md:w-88 border-r border-slate-200/80 flex flex-col shrink-0 bg-slate-50/70">
        {/* Header & View Mode Switcher */}
        <div className="p-4 border-b border-slate-200/80 space-y-3.5 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2.5 tracking-tight">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-md shadow-blue-500/20">
                <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center text-blue-300 backdrop-blur-xs">
                  <MessageSquareText className="h-4.5 w-4.5" />
                </div>
              </div>
              Live Support Inbox
            </h2>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setViewMode("property")}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "customer"
                  ? "bg-white text-blue-600 shadow-sm font-extrabold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              By Customer ({allConversations.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties or location..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Group / Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : viewMode === "property" ? (
            filteredGroups.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-xs font-semibold">
                No active property inquiries found.
              </div>
            ) : (
              filteredGroups.map((group, idx) => {
                const isSelected = selectedGroup?.listing.id === group.listing.id;
                return (
                  <motion.div
                    key={group.listing.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border-blue-300 shadow-sm ring-2 ring-blue-400/20"
                        : "bg-white border-slate-200/80 hover:border-blue-200 shadow-2xs hover:shadow-md"
                    }`}
                  >
                    {/* Property Card Header in List */}
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        if (group.conversations.length > 0) {
                          selectConversation(group.conversations[0]);
                        }
                      }}
                      className="w-full p-3 flex items-center gap-3 text-left cursor-pointer"
                    >
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
                        <span className="w-5.5 h-5.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25">
                          {group.totalUnread}
                        </span>
                      )}
                    </button>

                    {/* Sub-list of Buyers for this Property */}
                    {isSelected && (
                      <div className="border-t border-blue-100 bg-white/80 p-1.5 space-y-1">
                        {group.conversations.map((conv) => {
                          const isConvSelected = activeConversation?.id === conv.id;
                          const buyerName =
                            conv.user_profile?.display_name ||
                            `User ${conv.user_id.substring(0, 6)}`;
                          return (
                            <motion.button
                              key={conv.id}
                              whileHover={{ scale: 1.01, x: 2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => selectConversation(conv)}
                              className={`w-full p-2.5 px-3 rounded-xl text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                                isConvSelected
                                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold shadow-md shadow-blue-500/20"
                                  : "text-slate-700 hover:bg-blue-50/80 font-bold"
                              }`}
                            >
                              <span className="truncate flex items-center gap-1.5">
                                <UserCheck className="h-3.5 w-3.5 shrink-0 opacity-80" />
                                {buyerName}
                              </span>
                              {conv.unread_admin > 0 && (
                                <span className="w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                                  {conv.unread_admin}
                                </span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )
          ) : (
            /* By Customer List */
            filteredCustomers.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-xs font-semibold">
                No customer inquiries found.
              </div>
            ) : (
              filteredCustomers.map((conv, idx) => {
                const isSelected = activeConversation?.id === conv.id;
                const buyerName =
                  conv.user_profile?.display_name ||
                  `User ${conv.user_id.substring(0, 6)}`;
                const targetGroup = propertyGroups.find(
                  (g) => g.listing.id === conv.listing_id
                );
                return (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (targetGroup) setSelectedGroup(targetGroup);
                      selectConversation(conv);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white border-blue-600 shadow-md font-extrabold"
                        : "bg-white border-slate-200/80 hover:border-blue-200 text-slate-800 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-9.5 h-9.5 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs"
                        }`}
                      >
                        {buyerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs truncate">{buyerName}</h4>
                        <p
                          className={`text-[11px] truncate mt-0.5 font-semibold ${
                            isSelected ? "text-blue-100" : "text-slate-500"
                          }`}
                        >
                          {conv.listing?.title || "Property Inquiry"}
                        </p>
                      </div>
                    </div>
                    {conv.unread_admin > 0 && (
                      <span className="w-5.5 h-5.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs">
                        {conv.unread_admin}
                      </span>
                    )}
                  </motion.button>
                );
              })
            )
          )}
        </div>
      </div>

      {/* Right Main Chat Frame */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        {activeConversation && selectedGroup ? (
          <>
            {/* Top Pinned Property Header Showcase (Shopee / TikTok Style) */}
            <div className="p-4 border-b border-slate-200/80 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/90 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-13 h-13 rounded-2xl bg-white p-0.5 border border-blue-200/80 shadow-md shrink-0 overflow-hidden relative flex items-center justify-center">
                  {selectedGroup.listing.images?.[0] ? (
                    <img
                      src={selectedGroup.listing.images[0]}
                      alt={selectedGroup.listing.title}
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate">
                      {selectedGroup.listing.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600/10 text-blue-700 text-[10px] font-black shrink-0">
                      {selectedGroup.listing.tag || "For Sale"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs mt-1">
                    <span className="flex items-center gap-0.5 text-slate-500 truncate font-medium">
                      <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                      {selectedGroup.listing.location}
                    </span>
                    <span className="font-black text-blue-600 shrink-0">
                      {formatPrice(selectedGroup.listing.price)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/properties/${selectedGroup.listing.id}`}
                  target="_blank"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-xs hover:shadow-md"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">View Listing</span>
                </Link>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdminMsg = msg.sender_type === "admin";
                  const isSystem = msg.sender_type === "system";

                  if (isSystem) {
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center my-3"
                      >
                        <span className="inline-block px-4 py-1.5 bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-full shadow-2xs">
                          {msg.content}
                        </span>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className={`flex flex-col ${
                        isAdminMsg ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%]">
                        {!isAdminMsg && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-1 shadow-md shadow-blue-500/20">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                        )}
                        <div
                          className={`p-3.5 px-4 rounded-2xl text-sm leading-relaxed ${
                            isAdminMsg
                              ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-br-xs shadow-md shadow-blue-500/15 font-medium"
                              : "bg-white text-slate-800 border border-slate-200/70 rounded-bl-xs shadow-sm font-medium"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1 font-semibold">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Admin Canned Quick Responses */}
            <div className="px-4 py-3 bg-slate-100/90 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-extrabold text-slate-400 text-[11px] shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-500" />
                Quick Reply:
              </span>
              {[
                "Hello! How can I assist you with this property?",
                "Site visit is available this Saturday morning.",
                "Yes, the price is negotiable for serious buyers.",
                "Let me prepare the complete brochure for you.",
              ].map((reply) => (
                <motion.button
                  key={reply}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSendAdminMessage(reply);
                  }}
                  disabled={sending}
                  className="px-3.5 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200/80 rounded-xl shrink-0 transition-colors cursor-pointer text-[11px] font-bold disabled:opacity-50 shadow-2xs"
                >
                  {reply}
                </motion.button>
              ))}
            </div>

            {/* Elevated Input Form */}
            <div className="p-3.5 bg-white border-t border-slate-200/80 shadow-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAdminMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type admin response..."
                  className="flex-1 px-4 py-3 bg-slate-100/90 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder:text-slate-400 font-medium"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="p-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-blue-500/25 shrink-0"
                >
                  <Send className="h-4.5 w-4.5" />
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/50">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
              <MessageSquareText className="h-8 w-8 text-blue-500" />
            </div>
            <p className="font-extrabold text-base text-slate-800">
              No Conversation Selected
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-medium">
              Select a property inquiry or customer from the left sidebar to start communicating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
