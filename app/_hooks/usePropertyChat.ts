"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  getUserConversations,
  getConversationMessages,
  initiatePropertyConversation,
  sendChatMessage,
  markMessagesAsRead,
  getUnreadChatCount,
} from "../_actions/chat";
import type { PropertyConversation, PropertyChatMessage } from "../_types/chat";
import { useAuthContext } from "../_context/AuthContext";
import { toast } from "sonner";

export function usePropertyChat(isAdmin = false) {
  const { user, isSignedIn } = useAuthContext();
  const [conversations, setConversations] = useState<PropertyConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<PropertyConversation | null>(null);
  const [messages, setMessages] = useState<PropertyChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const activeConvRef = useRef<PropertyConversation | null>(null);
  activeConvRef.current = activeConversation;

  // Load user conversations
  const loadConversations = useCallback(async () => {
    if (!isSignedIn) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    try {
      const data = await getUserConversations();
      setConversations(data);
      const count = await getUnreadChatCount(isAdmin);
      setUnreadCount(count);
    } catch (err) {
      console.error("Error loading chat conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [isSignedIn, isAdmin]);

  // Load message history when active conversation changes
  const selectConversation = useCallback(
    async (conv: PropertyConversation) => {
      setActiveConversation(conv);
      setLoadingMessages(true);

      // Immediately zero-out unread badge in local conversations state
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id
            ? {
                ...c,
                unread_user: isAdmin ? c.unread_user : 0,
                unread_admin: isAdmin ? 0 : c.unread_admin,
              }
            : c
        )
      );

      try {
        const msgs = await getConversationMessages(conv.id);
        setMessages(msgs);
        await markMessagesAsRead(conv.id, isAdmin);
        const count = await getUnreadChatCount(isAdmin);
        setUnreadCount(count);
      } catch (err) {
        console.error("Error loading messages:", err);
        toast.error("Failed to load message history.");
      } finally {
        setLoadingMessages(false);
      }
    },
    [isAdmin]
  );

  // Open or initiate chat for a specific property listing
  const openChatForProperty = useCallback(
    async (listingId: number) => {
      if (!isSignedIn) return null;

      try {
        const { conversation } = await initiatePropertyConversation(listingId);
        await loadConversations();
        await selectConversation(conversation);
        return conversation;
      } catch (err: any) {
        toast.error(err.message || "Failed to start chat.");
        return null;
      }
    },
    [isSignedIn, loadConversations, selectConversation]
  );

  // Send message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation || !content.trim()) return;

      setSending(true);
      try {
        const senderType = isAdmin ? "admin" : "user";
        const newMsg = await sendChatMessage(activeConversation.id, content, senderType);

        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? { ...c, last_message: content.trim(), last_message_at: new Date().toISOString() }
              : c
          )
        );
      } catch (err: any) {
        toast.error(err.message || "Failed to send message.");
      } finally {
        setSending(false);
      }
    },
    [activeConversation, isAdmin]
  );

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Supabase Realtime subscription for instant message delivery
  useEffect(() => {
    if (!isSignedIn || !user) return;

    const supabase = createClient();
    const channelId = `property_chat_user_${user.id}_${Math.random().toString(36).substring(2, 7)}`;
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
            markMessagesAsRead(currentActive.id, isAdmin);
          } else {
            setUnreadCount((prev) => prev + 1);
          }

        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("Realtime subscription error:", err);
        } else {
          console.log(`Realtime channel [${channelId}] status:`, status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSignedIn, isAdmin, loadConversations]);

  return {
    user,
    conversations,
    activeConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sending,
    unreadCount,
    selectConversation,
    openChatForProperty,
    handleSendMessage,
    loadConversations,
  };
}
