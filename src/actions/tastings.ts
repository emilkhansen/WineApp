"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tasting, TastingFormData, TastingWithWine, TastingWithWineAndAuthor } from "@/lib/types";
import { getFriends } from "./friends";

export async function getTastings(): Promise<TastingWithWine[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("tastings")
    .select(`
      *,
      wine:wines(*)
    `)
    .eq("user_id", user.id)
    .order("tasting_date", { ascending: false });

  if (error) {
    console.error("Error fetching tastings:", error);
    return [];
  }

  return data || [];
}

export async function getTastingsWithFriends(): Promise<TastingWithWineAndAuthor[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get current user's profile
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // Get user's own tastings
  const { data: myTastings, error: myError } = await supabase
    .from("tastings")
    .select(`
      *,
      wine:wines(*)
    `)
    .eq("user_id", user.id)
    .order("tasting_date", { ascending: false });

  if (myError) {
    console.error("Error fetching my tastings:", myError);
    return [];
  }

  // Get friends
  const friends = await getFriends();
  const friendIds = friends.map(f => f.profile.id);

  // Get friends' tastings (only public wines)
  let friendTastings: TastingWithWine[] = [];
  if (friendIds.length > 0) {
    const { data, error } = await supabase
      .from("tastings")
      .select(`
        *,
        wine:wines!inner(*)
      `)
      .in("user_id", friendIds)
      .eq("wines.is_public", true)
      .order("tasting_date", { ascending: false });

    if (error) {
      console.error("Error fetching friend tastings:", error);
    } else {
      friendTastings = (data || []) as TastingWithWine[];
    }
  }

  // Create a map of friend profiles for quick lookup
  const friendProfileMap = new Map(friends.map(f => [f.profile.id, f.profile]));

  // Combine and add author info
  const myTastingsWithAuthor: TastingWithWineAndAuthor[] = (myTastings || []).map(t => ({
    ...t,
    author: {
      id: user.id,
      username: myProfile?.username || null,
      isMe: true,
    },
  }));

  const friendTastingsWithAuthor: TastingWithWineAndAuthor[] = friendTastings.map(t => {
    const friendProfile = friendProfileMap.get(t.user_id);
    return {
      ...t,
      author: {
        id: t.user_id,
        username: friendProfile?.username || null,
        isMe: false,
      },
    };
  });

  // Combine and sort by date
  const allTastings = [...myTastingsWithAuthor, ...friendTastingsWithAuthor];
  allTastings.sort((a, b) => new Date(b.tasting_date).getTime() - new Date(a.tasting_date).getTime());

  return allTastings;
}

export async function getTastingsForWine(wineId: string): Promise<Tasting[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("tastings")
    .select("*")
    .eq("wine_id", wineId)
    .eq("user_id", user.id)
    .order("tasting_date", { ascending: false });

  if (error) {
    console.error("Error fetching tastings for wine:", error);
    return [];
  }

  return data || [];
}

export async function getTasting(id: string): Promise<TastingWithWine | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("tastings")
    .select(`
      *,
      wine:wines(*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching tasting:", error);
    return null;
  }

  return data;
}

export async function createTasting(formData: TastingFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Create the tasting
  const { data, error } = await supabase
    .from("tastings")
    .insert({
      user_id: user.id,
      wine_id: formData.wine_id,
      rating: formData.rating,
      notes: formData.notes || null,
      tasting_date: formData.tasting_date,
      location: formData.location || null,
      occasion: formData.occasion || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating tasting:", error);
    return { error: error.message };
  }

  // Decrement wine stock
  const { error: stockError } = await supabase.rpc("decrement_stock", {
    wine_id: formData.wine_id,
  });

  // If RPC doesn't exist, do it manually
  if (stockError) {
    await supabase
      .from("wines")
      .update({ stock: supabase.rpc("greatest", { a: 0, b: "stock - 1" }) })
      .eq("id", formData.wine_id)
      .eq("user_id", user.id);

    // Fallback: just decrement manually
    const { data: wine } = await supabase
      .from("wines")
      .select("stock")
      .eq("id", formData.wine_id)
      .single();

    if (wine) {
      await supabase
        .from("wines")
        .update({ stock: Math.max(0, wine.stock - 1) })
        .eq("id", formData.wine_id)
        .eq("user_id", user.id);
    }
  }

  revalidatePath("/tastings");
  revalidatePath("/wines");
  revalidatePath(`/wines/${formData.wine_id}`);

  return { data };
}

export async function updateTasting(id: string, formData: Partial<TastingFormData>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updateData: Record<string, unknown> = {};
  if (formData.rating !== undefined) updateData.rating = formData.rating;
  if (formData.notes !== undefined) updateData.notes = formData.notes || null;
  if (formData.tasting_date !== undefined) updateData.tasting_date = formData.tasting_date;
  if (formData.location !== undefined) updateData.location = formData.location || null;
  if (formData.occasion !== undefined) updateData.occasion = formData.occasion || null;

  const { data, error } = await supabase
    .from("tastings")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating tasting:", error);
    return { error: error.message };
  }

  revalidatePath("/tastings");
  revalidatePath(`/tastings/${id}`);

  return { data };
}

export async function deleteTasting(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("tastings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting tasting:", error);
    return { error: error.message };
  }

  revalidatePath("/tastings");
  redirect("/tastings");
}
