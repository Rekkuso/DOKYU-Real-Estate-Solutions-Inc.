"use server";

import { checkIsAdmin } from "./admin";
import { getProfile } from "./profile";
import { getDraftListings } from "./listing";
import { getLikedListings } from "./likes";
import { getAllUsers } from "./users";

export async function getAdminDashboardData() {
  await checkIsAdmin();

  const [profile, drafts, likes, usersData] = await Promise.all([
    getProfile(),
    getDraftListings(),
    getLikedListings(),
    getAllUsers(1, 50),
  ]);

  return {
    profile,
    drafts,
    likes,
    users: usersData.users,
    totalUsers: usersData.total,
    stats: {
      totalUsers: usersData.total,
      totalDrafts: drafts.length,
      totalLikes: likes.length,
    },
  };
}
