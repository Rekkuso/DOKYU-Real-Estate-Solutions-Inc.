/**
 * Shared type definitions for user/profile-related data.
 * Centralized here to avoid coupling UI components to server action modules.
 */

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  avatar_url: string | null;
  is_banned: boolean;
  created_at: string;
}

export interface ProfileData {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  avatar_url: string | null;
  is_banned: boolean;
  created_at: string;
}
