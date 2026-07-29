"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { supabaseAdmin as supabase } from "@/utils/supabase/admin";
import type { PropertyConversation, PropertyChatMessage } from "../../_types/chat";

/**
 * Initiate or open an existing property conversation thread for the logged-in user.
 */
export async function initiatePropertyConversation(listingId: number): Promise<{
  conversation: PropertyConversation;
  isNew: boolean;
}> {
  const cookieStore = await cookies();
  const supabaseClient = createClient(cookieStore);

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to inquire about properties.");
  }

  // 1. Check if conversation already exists for this (user_id, listing_id)
  const { data: existing } = await supabase
    .from("property_conversations")
    .select(`
      *,
      listing:listing(id, title, location, address, price, beds, baths, area, type, tag, images, date, active)
    `)
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    return {
      conversation: existing as unknown as PropertyConversation,
      isNew: false,
    };
  }

  // 2. Insert new conversation thread
  const { data: created, error } = await supabase
    .from("property_conversations")
    .insert([
      {
        user_id: user.id,
        listing_id: Number(listingId),
        status: "active",
      },
    ])
    .select(`
      *,
      listing:listing(id, title, location, address, price, beds, baths, area, type, tag, images, date, active)
    `)
    .maybeSingle();

  if (error || !created) {
    console.error("Error initiating conversation:", error);
    throw new Error(error?.message || "Failed to start chat for this property.");
  }

  // 3. Post initial system message
  const listingTitle = (created.listing as any)?.title || "this property";
  await supabase.from("property_chat_messages").insert([
    {
      conversation_id: created.id,
      sender_id: null,
      sender_type: "system",
      content: `Inquiry initiated regarding "${listingTitle}". A DOKYU agent will be with you shortly.`,
    },
  ]);

  return {
    conversation: created as unknown as PropertyConversation,
    isNew: true,
  };
}

/**
 * Send a chat message in a conversation thread.
 */
export async function sendChatMessage(
  conversationId: string,
  content: string,
  senderType: "user" | "admin" = "user"
): Promise<PropertyChatMessage> {
  try {
    const cookieStore = await cookies();
    const supabaseClient = createClient(cookieStore);

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("You must be authenticated to send messages.");
    }

    if (!content.trim()) {
      throw new Error("Message cannot be empty.");
    }

    // Check authorization: if user, verify conversation belongs to user; if admin, verify admin role
    const { data: conv, error: convFetchErr } = await supabase
      .from("property_conversations")
      .select("user_id, unread_admin, unread_user")
      .eq("id", conversationId)
      .maybeSingle();

    if (convFetchErr || !conv) {
      throw new Error("Conversation not found.");
    }

    if (senderType === "user" && conv.user_id !== user.id) {
      throw new Error("Unauthorized access to this conversation.");
    }

    if (senderType === "admin") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        throw new Error("Unauthorized: Admin privileges required.");
      }
    }

    // 1. Insert message
    const { data: msg, error: msgError } = await supabase
      .from("property_chat_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: senderType,
        content: content.trim(),
      })
      .select("*")
      .single();

    if (msgError || !msg) {
      console.error("Error sending message:", msgError);
      throw new Error(msgError?.message || "Failed to send message.");
    }

    // 2. Update conversation last_message_at & increment unread counter
    const updateData: any = {
      last_message_at: new Date().toISOString(),
    };

    if (senderType === "user") {
      // Increment admin unread count
      const { data: conv } = await supabase
        .from("property_conversations")
        .select("unread_admin")
        .eq("id", conversationId)
        .maybeSingle();
      updateData.unread_admin = (conv?.unread_admin || 0) + 1;
    } else if (senderType === "admin") {
      // Increment user unread count
      const { data: conv } = await supabase
        .from("property_conversations")
        .select("unread_user")
        .eq("id", conversationId)
        .maybeSingle();
      updateData.unread_user = (conv?.unread_user || 0) + 1;
    }

    await supabase
      .from("property_conversations")
      .update(updateData)
      .eq("id", conversationId);

    return msg as PropertyChatMessage;
  } catch (err: any) {
    console.error("sendChatMessage exception:", err);
    throw new Error(err?.message || "Failed to send message.");
  }
}

/**
 * Mark all messages in a conversation as read.
 */
export async function markMessagesAsRead(
  conversationId: string,
  isForAdmin = false
) {
  try {
    const updateData = isForAdmin ? { unread_admin: 0 } : { unread_user: 0 };

    const { error: convErr } = await supabase
      .from("property_conversations")
      .update(updateData)
      .eq("id", conversationId);

    if (convErr) {
      console.error("Error updating conversation unread count:", convErr);
    }

    const { error: msgErr } = await supabase
      .from("property_chat_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId);

    if (msgErr) {
      console.error("Error updating messages is_read:", msgErr);
    }
  } catch (err) {
    console.error("markMessagesAsRead exception:", err);
  }

  return { success: true };
}
