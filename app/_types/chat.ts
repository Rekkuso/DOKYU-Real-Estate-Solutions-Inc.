import type { Listing } from "./listing";

export interface PropertyConversation {
  id: string;
  user_id: string;
  listing_id: number;
  status: "active" | "resolved" | "archived";
  last_message_at: string;
  unread_admin: number;
  unread_user: number;
  created_at: string;
  /** Joined property details */
  listing?: Listing | null;
  /** Joined user profile details (for Admin view) */
  user_profile?: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  /** Last message content preview */
  last_message?: string | null;
}

export interface PropertyChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: "user" | "admin" | "system";
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminPropertyChatGroup {
  listing: Listing;
  conversations: PropertyConversation[];
  totalUnread: number;
}
