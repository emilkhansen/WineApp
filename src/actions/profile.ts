"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    // If profile doesn't exist, create it
    if (error.code === "PGRST116") {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email!,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating profile:", createError);
        return null;
      }
      return newProfile;
    }
    return null;
  }

  return data;
}

export async function updateProfile({ username }: { username: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate username
  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 3) {
    return { error: "Username must be at least 3 characters" };
  }
  if (trimmedUsername.length > 30) {
    return { error: "Username must be 30 characters or less" };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    return { error: "Username can only contain letters, numbers, and underscores" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ username: trimmedUsername })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    if (error.code === "23505") {
      return { error: "Username is already taken" };
    }
    return { error: error.message };
  }

  revalidatePath("/friends");
  return { data };
}

export async function checkUsernameAvailable(username: string): Promise<{ available: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { available: false, error: "Not authenticated" };
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 3) {
    return { available: false, error: "Username must be at least 3 characters" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", trimmedUsername)
    .neq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error checking username:", error);
    return { available: false, error: error.message };
  }

  return { available: data === null };
}

export async function searchProfileByEmail(email: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const trimmedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", trimmedEmail)
    .neq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error searching profile:", error);
    return null;
  }

  return data;
}
