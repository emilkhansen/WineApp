"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FriendWithProfile, PendingRequest, Wine, Tasting } from "@/lib/types";

export async function getFriends(): Promise<FriendWithProfile[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get friendships where current user is either user_id or friend_id
  const { data: sentFriendships, error: sentError } = await supabase
    .from("friendships")
    .select(`
      id,
      user_id,
      friend_id,
      status,
      created_at,
      profile:profiles!friendships_friend_id_fkey(*)
    `)
    .eq("user_id", user.id)
    .eq("status", "accepted");

  const { data: receivedFriendships, error: receivedError } = await supabase
    .from("friendships")
    .select(`
      id,
      user_id,
      friend_id,
      status,
      created_at,
      profile:profiles!friendships_user_id_fkey(*)
    `)
    .eq("friend_id", user.id)
    .eq("status", "accepted");

  if (sentError || receivedError) {
    console.error("Error fetching friends:", sentError || receivedError);
    return [];
  }

  const friends: FriendWithProfile[] = [
    ...(sentFriendships || []).map((f) => ({
      id: f.id,
      user_id: f.user_id,
      friend_id: f.friend_id,
      status: f.status as "pending" | "accepted",
      created_at: f.created_at,
      profile: (Array.isArray(f.profile) ? f.profile[0] : f.profile) as FriendWithProfile["profile"],
    })),
    ...(receivedFriendships || []).map((f) => ({
      id: f.id,
      user_id: f.user_id,
      friend_id: f.friend_id,
      status: f.status as "pending" | "accepted",
      created_at: f.created_at,
      profile: (Array.isArray(f.profile) ? f.profile[0] : f.profile) as FriendWithProfile["profile"],
    })),
  ];

  return friends;
}

export async function getPendingRequests(): Promise<PendingRequest[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get pending requests where current user is the recipient (friend_id)
  const { data, error } = await supabase
    .from("friendships")
    .select(`
      id,
      user_id,
      friend_id,
      status,
      created_at,
      sender:profiles!friendships_user_id_fkey(*)
    `)
    .eq("friend_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }

  return (data || []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    friend_id: r.friend_id,
    status: r.status as "pending" | "accepted",
    created_at: r.created_at,
    sender: (Array.isArray(r.sender) ? r.sender[0] : r.sender) as PendingRequest["sender"],
  }));
}

export async function sendFriendRequest(email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Find the user by email
  const { data: targetProfile, error: searchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", trimmedEmail)
    .maybeSingle();

  if (searchError) {
    console.error("Error searching for user:", searchError);
    return { error: "Failed to find user" };
  }

  if (!targetProfile) {
    return { error: "No user found with that email" };
  }

  if (targetProfile.id === user.id) {
    return { error: "You cannot send a friend request to yourself" };
  }

  // Check if friendship already exists (in either direction)
  const { data: existingFriendship } = await supabase
    .from("friendships")
    .select("id, status")
    .or(`and(user_id.eq.${user.id},friend_id.eq.${targetProfile.id}),and(user_id.eq.${targetProfile.id},friend_id.eq.${user.id})`)
    .maybeSingle();

  if (existingFriendship) {
    if (existingFriendship.status === "accepted") {
      return { error: "You are already friends with this user" };
    }
    return { error: "A friend request already exists" };
  }

  // Create the friend request
  const { data, error } = await supabase
    .from("friendships")
    .insert({
      user_id: user.id,
      friend_id: targetProfile.id,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending friend request:", error);
    return { error: error.message };
  }

  revalidatePath("/friends");
  return { data };
}

export async function acceptFriendRequest(friendshipId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .eq("friend_id", user.id) // Only the recipient can accept
    .eq("status", "pending")
    .select()
    .single();

  if (error) {
    console.error("Error accepting friend request:", error);
    return { error: error.message };
  }

  revalidatePath("/friends");
  return { data };
}

export async function rejectFriendRequest(friendshipId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .eq("friend_id", user.id) // Only the recipient can reject
    .eq("status", "pending");

  if (error) {
    console.error("Error rejecting friend request:", error);
    return { error: error.message };
  }

  revalidatePath("/friends");
  return { success: true };
}

export async function removeFriend(friendshipId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Either party can remove the friendship
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

  if (error) {
    console.error("Error removing friend:", error);
    return { error: error.message };
  }

  revalidatePath("/friends");
  return { success: true };
}

export async function getFriendWines(friendId: string): Promise<Wine[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Verify friendship exists and is accepted
  const { data: friendship } = await supabase
    .from("friendships")
    .select("id")
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
    .eq("status", "accepted")
    .maybeSingle();

  if (!friendship) {
    return [];
  }

  // Get friend's wines
  const { data, error } = await supabase
    .from("wines")
    .select("*")
    .eq("user_id", friendId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching friend wines:", error);
    return [];
  }

  return data || [];
}

export async function getFriendTastings(friendId: string): Promise<(Tasting & { wine: Wine })[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Verify friendship exists and is accepted
  const { data: friendship } = await supabase
    .from("friendships")
    .select("id")
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
    .eq("status", "accepted")
    .maybeSingle();

  if (!friendship) {
    return [];
  }

  // Get friend's tastings
  const { data, error } = await supabase
    .from("tastings")
    .select(`
      *,
      wine:wines(*)
    `)
    .eq("user_id", friendId)
    .order("tasting_date", { ascending: false });

  if (error) {
    console.error("Error fetching friend tastings:", error);
    return [];
  }

  return (data || []).filter(t => t.wine !== null) as (Tasting & { wine: Wine })[];
}

export async function getFriendProfile(friendId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Verify friendship exists and is accepted
  const { data: friendship } = await supabase
    .from("friendships")
    .select("id")
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
    .eq("status", "accepted")
    .maybeSingle();

  if (!friendship) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", friendId)
    .single();

  if (error) {
    console.error("Error fetching friend profile:", error);
    return null;
  }

  return data;
}
