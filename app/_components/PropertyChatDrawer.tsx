"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  MessageSquareText,
  MapPin,
  ExternalLink,
  ChevronLeft,
  Building2,
  Sparkles,
  Loader2,
  ShieldCheck,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { usePropertyChat } from "../_hooks/usePropertyChat";
import { formatPrice } from "@/utils/format";
import { Button } from "@/components/ui/button";

interface PropertyChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialListingId?: number | null;
}

export default function PropertyChatDrawer({
  isOpen,
  onClose,
  initialListingId,
}: PropertyChatDrawerProps) {
  const {
    user,
    conversations,
    activeConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sending,
    selectConversation,
    openChatForProperty,
    handleSendMessage,
  } = usePropertyChat(false);

  const [inputMessage, setInputMessage] = useState("");
  const [showThreadList, setShowThreadList] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom of chat window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Open specific listing chat on mount if initialListingId provided
  useEffect(() => {
    if (isOpen && initialListingId) {
      openChatForProperty(initialListingId);
    }
  }, [isOpen, initialListingId, openChatForProperty]);

  if (!mounted) return null;

  const currentListing = activeConversation?.listing;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
          {/* Mobile backdrop for small screens */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs sm:hidden pointer-events-auto"
          />

          {/* Floating Chat Tab Widget - Hanging Directly from Top Header Chat Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.1, y: -30, x: 20, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.1, y: -30, x: 20, filter: "blur(12px)" }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            style={{ transformOrigin: "top right" }}
            className="fixed top-20 right-3 sm:right-6 md:right-10 z-[9999] w-[95vw] sm:w-[480px] md:w-[500px] h-[680px] max-h-[82vh] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-slate-200/90 pointer-events-auto origin-top-right"
          >
            {/* Minimalist Light Blue Gradient Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-between shadow-xs shrink-0 relative border-b border-white/15">
              <div className="flex items-center gap-3">
                {activeConversation && !showThreadList && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowThreadList(true)}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer mr-0.5 text-white/90"
                    title="Back to Property Inquiries"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>
                )}
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs border border-white/30">
                  <MessageSquareText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-white leading-tight flex items-center gap-2">
                    Live Support
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                  </h2>
                  <p className="text-[11px] text-blue-100/90 font-medium">
                    DOKYU Real Estate Concierge
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {conversations.length > 1 && !showThreadList && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowThreadList(true)}
                    className="text-[11px] font-bold text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full transition-all cursor-pointer border border-white/20 shadow-2xs"
                  >
                    All ({conversations.length})
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </motion.button>
              </div>
            </div>

            {/* Body Content */}
            {loadingConversations ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 bg-slate-50/50">
                <Loader2 className="h-9 w-9 text-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center mb-5 shadow-xl shadow-blue-500/20">
                  <Sparkles className="h-10 w-10 animate-bounce" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  No Active Inquiries
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mb-8 leading-relaxed font-medium">
                  Browse our real estate listings and tap <strong className="text-slate-800 font-bold">&quot;Inquire Agent&quot;</strong> to start chatting directly with a DOKYU representative.
                </p>
                <Link href="/properties" onClick={onClose}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-2xl font-bold px-7 py-6 text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl cursor-pointer">
                      Browse Properties
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            ) : showThreadList || !activeConversation ? (
              /* Property Inquiries List */
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/80">
                <div className="flex items-center justify-between px-1 mb-1">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Your Inquired Properties ({conversations.length})
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {conversations.map((conv, idx) => (
                    <motion.button
                      key={conv.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ scale: 1.015, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        selectConversation(conv);
                        setShowThreadList(false);
                      }}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeConversation?.id === conv.id
                          ? "bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border-blue-300 shadow-md ring-2 ring-blue-400/20"
                          : "bg-white border-slate-200/80 hover:border-blue-300 shadow-sm hover:shadow-md"
                      }`}
                    >
                      <div className="w-13 h-13 rounded-2xl bg-slate-100 overflow-hidden shrink-0 relative border border-slate-200 shadow-inner flex items-center justify-center">
                        {conv.listing?.images?.[0] ? (
                          <img
                            src={conv.listing.images[0]}
                            alt={conv.listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {conv.listing?.title || "Property Inquiry"}
                        </h4>
                        {conv.listing && (
                          <p className="text-xs font-black text-blue-600 mt-0.5">
                            {formatPrice(conv.listing.price)}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 truncate mt-1 font-medium">
                          {conv.last_message || "Tap to view conversation"}
                        </p>
                      </div>
                      {conv.unread_user > 0 && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
                          {conv.unread_user}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              /* Active Chat Window */
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50/60">
                {/* Pinned Property Showcase Header (Shopee / TikTok Shop Style) */}
                {currentListing && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/90 border-b border-blue-100 p-3.5 px-4 flex items-center justify-between shadow-xs shrink-0"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-13 h-13 rounded-2xl bg-white p-0.5 border border-blue-200/80 shadow-md shrink-0 overflow-hidden relative flex items-center justify-center">
                        {currentListing.images?.[0] ? (
                          <img
                            src={currentListing.images[0]}
                            alt={currentListing.title}
                            className="w-full h-full object-cover rounded-[14px]"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {currentListing.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="flex items-center gap-0.5 text-slate-500 truncate font-medium">
                            <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            {currentListing.location}
                          </span>
                          <span className="font-black text-blue-600 bg-blue-600/10 px-2.5 py-0.5 rounded-full text-[11px] shrink-0">
                            {formatPrice(currentListing.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/properties/${currentListing.id}`}
                      onClick={onClose}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 text-xs font-bold shadow-xs hover:shadow-md"
                    >
                      View
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </motion.div>
                )}

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isUser = msg.sender_type === "user";
                      const isSystem = msg.sender_type === "system";

                      if (isSystem) {
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center my-4"
                          >
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-full shadow-2xs">
                              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
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
                            isUser ? "items-end" : "items-start"
                          }`}
                        >
                          <div className="flex items-end gap-2 max-w-[85%]">
                            {!isUser && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mb-1 shadow-md shadow-blue-500/20 border border-white">
                                <ShieldCheck className="h-4 w-4" />
                              </div>
                            )}
                            <div
                              className={`p-3.5 px-4 rounded-2xl text-sm leading-relaxed ${
                                isUser
                                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-tr-xs shadow-md shadow-blue-500/15 font-medium"
                                  : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-sm font-medium"
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

                {/* Chat Input Bar */}
                <div className="p-3.5 bg-white border-t border-slate-200/80 shadow-2xl shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (inputMessage.trim()) {
                        handleSendMessage(inputMessage);
                        setInputMessage("");
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type a message..."
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
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
