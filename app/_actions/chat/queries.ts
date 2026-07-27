"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { supabaseAdmin as supabase } from "@/utils/supabase/admin";
import type { PropertyConversation, PropertyChatMessage, AdminPropertyChatGroup } from "../../_types/chat";
import type { Listing } from "../../_types/listing";

/**
 * Fetch all property chat threads for the current logged-in user.
 * Joins property (listing) metadata.
 */
export async function getUserConversations(): Promise<PropertyConversation[]> {
  try {
    const cookieStore = await cookies();
    const supabaseClient = createClient(cookieStore);

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("property_conversations")
      .select(`
        *,
        listing:listing(id, title, location, address, price, beds, baths, area, type, tag, images, date, active)
      `)
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Error fetching user conversations:", error.message);
      return [];
    }

    // Fetch last message preview for each conversation
    const conversationsWithLastMsg = await Promise.all(
      (data || []).map(async (conv) => {
        const { data: msgData } = await supabase
          .from("property_chat_messages")
          .select("content")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        return {
          ...conv,
          listing: conv.listing as unknown as Listing,
          last_message: msgData?.content || null,
        } as PropertyConversation;
      })
    );

    return conversationsWithLastMsg;
  } catch (err) {
    console.error("getUserConversations exception:", err);
    return [];
  }
}

/**
 * Fetch messages for a specific conversation thread.
 */
export async function getConversationMessages(
  conversationId: string
): Promise<PropertyChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from("property_chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching conversation messages:", error.message);
      return [];
    }

    return (data || []) as PropertyChatMessage[];
  } catch (err) {
    console.error("getConversationMessages exception:", err);
    return [];
  }
}

/**
 * Admin Action: Fetch all conversations grouped by Property Card.
 */
export async function getAdminConversationsByProperty(): Promise<AdminPropertyChatGroup[]> {
  try {
    const { data: convs, error } = await supabase
      .from("property_conversations")
      .select(`
        *,
        listing:listing(id, title, location, address, price, beds, baths, area, type, tag, images, date, active)
      `)
      .order("last_message_at", { ascending: false });

    if (error || !convs) {
      console.error("Error fetching admin conversations:", error?.message);
      return [];
    }

    // Fetch user profiles & last message for each conversation
    const userIds = Array.from(new Set(convs.map((c) => c.user_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]));

    const enrichedConvs: PropertyConversation[] = await Promise.all(
      convs.map(async (c) => {
        const p = profileMap.get(c.user_id);
        const { data: msgData } = await supabase
          .from("property_chat_messages")
          .select("content")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        return {
          ...c,
          listing: c.listing as unknown as Listing,
          user_profile: p
            ? {
                display_name: p.display_name,
                email: "",
                avatar_url: p.avatar_url,
              }
            : null,
          last_message: msgData?.content || null,
        } as PropertyConversation;
      })
    );

    // Group by Property (Listing ID)
    const groupMap = new Map<number, AdminPropertyChatGroup>();

    for (const conv of enrichedConvs) {
      if (!conv.listing) continue;

      const listingId = conv.listing.id;
      if (!groupMap.has(listingId)) {
        groupMap.set(listingId, {
          listing: conv.listing,
          conversations: [],
          totalUnread: 0,
        });
      }

      const group = groupMap.get(listingId)!;
      group.conversations.push(conv);
      group.totalUnread += conv.unread_admin || 0;
    }

    return Array.from(groupMap.values());
  } catch (err) {
    console.error("getAdminConversationsByProperty exception:", err);
    return [];
  }
}

/**
 * Get total unread chat count for current user (or admin).
 */
export async function getUnreadChatCount(isAdmin = false): Promise<number> {
  try {
    const cookieStore = await cookies();
    const supabaseClient = createClient(cookieStore);

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) return 0;

    if (isAdmin) {
      const { data, error } = await supabase
        .from("property_conversations")
        .select("unread_admin");
      if (error) return 0;
      return (data || []).reduce((sum, c) => sum + (c.unread_admin || 0), 0);
    } else {
      const { data, error } = await supabase
        .from("property_conversations")
        .select("unread_user")
        .eq("user_id", user.id);
      if (error) return 0;
      return (data || []).reduce((sum, c) => sum + (c.unread_user || 0), 0);
    }
  } catch (err) {
    console.error("getUnreadChatCount exception:", err);
    return 0;
  }
}
