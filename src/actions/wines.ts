"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wine, WineFormData, ExtractedWineData } from "@/lib/types";

export async function getWines(): Promise<Wine[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("wines")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching wines:", error);
    return [];
  }

  return data || [];
}

export async function getWine(id: string): Promise<{ wine: Wine; isOwner: boolean } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // First try to get user's own wine
  const { data: ownWine } = await supabase
    .from("wines")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (ownWine) {
    return { wine: ownWine, isOwner: true };
  }

  // If not own wine, check if it's a friend's wine (RLS will handle access)
  const { data: friendWine, error } = await supabase
    .from("wines")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !friendWine) {
    console.error("Error fetching wine:", error);
    return null;
  }

  return { wine: friendWine, isOwner: false };
}

export async function createWine(formData: WineFormData, imageUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("wines")
    .insert({
      user_id: user.id,
      producer: formData.producer || null,
      vintage: formData.vintage || null,
      region: formData.region || null,
      subregion: formData.subregion || null,
      grape: formData.grape || null,
      appellation: formData.appellation || null,
      vineyard: formData.vineyard || null,
      cru: formData.cru || null,
      color: formData.color || null,
      size: formData.size || null,
      image_url: imageUrl || null,
      stock: formData.stock || 1,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating wine:", error);
    return { error: error.message };
  }

  revalidatePath("/wines");
  return { data };
}

export async function updateWine(id: string, formData: WineFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("wines")
    .update({
      producer: formData.producer || null,
      vintage: formData.vintage || null,
      region: formData.region || null,
      subregion: formData.subregion || null,
      grape: formData.grape || null,
      appellation: formData.appellation || null,
      vineyard: formData.vineyard || null,
      cru: formData.cru || null,
      color: formData.color || null,
      size: formData.size || null,
      stock: formData.stock,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating wine:", error);
    return { error: error.message };
  }

  revalidatePath("/wines");
  revalidatePath(`/wines/${id}`);
  return { data };
}

export async function deleteWine(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("wines")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting wine:", error);
    return { error: error.message };
  }

  revalidatePath("/wines");
  redirect("/wines");
}

export async function updateWineStock(id: string, stock: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("wines")
    .update({ stock: Math.max(0, stock) })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating wine stock:", error);
    return { error: error.message };
  }

  revalidatePath("/wines");
  revalidatePath(`/wines/${id}`);
  return { success: true };
}

export async function toggleWinePublic(id: string, isPublic: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("wines")
    .update({ is_public: isPublic })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error toggling wine visibility:", error);
    return { error: error.message };
  }

  revalidatePath("/wines");
  revalidatePath(`/wines/${id}`);
  return { success: true };
}

export async function uploadWineImage(file: File): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("wine-labels")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image:", error);
    return { error: error.message };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("wine-labels")
    .getPublicUrl(fileName);

  return { url: publicUrl };
}

export async function createWines(
  wines: WineFormData[],
  imageUrl?: string
): Promise<{ data?: Wine[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const wineRecords = wines.map((formData) => ({
    user_id: user.id,
    producer: formData.producer || null,
    vintage: formData.vintage || null,
    region: formData.region || null,
    subregion: formData.subregion || null,
    grape: formData.grape || null,
    appellation: formData.appellation || null,
    vineyard: formData.vineyard || null,
    cru: formData.cru || null,
    color: formData.color || null,
    size: formData.size || null,
    image_url: imageUrl || null,
    stock: formData.stock || 1,
  }));

  const { data, error } = await supabase
    .from("wines")
    .insert(wineRecords)
    .select();

  if (error) {
    console.error("Error creating wines:", error);
    return { error: error.message };
  }

  revalidatePath("/wines");
  return { data: data as Wine[] };
}

export async function findMatchingWine(
  extracted: ExtractedWineData
): Promise<{ wine: Wine; confidence: "high" | "medium" } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Need at least producer or appellation to match
  if (!user || (!extracted.producer && !extracted.appellation)) {
    return null;
  }

  // Get all user's wines for matching
  const { data: wines, error } = await supabase
    .from("wines")
    .select("*")
    .eq("user_id", user.id);

  if (error || !wines || wines.length === 0) {
    return null;
  }

  // Helper for fuzzy string matching
  const fuzzyMatch = (a: string | null | undefined, b: string | null | undefined): { exact: boolean; partial: boolean } => {
    if (!a || !b) return { exact: false, partial: false };
    const aLower = a.toLowerCase().trim();
    const bLower = b.toLowerCase().trim();
    if (aLower === bLower) return { exact: true, partial: true };
    if (aLower.includes(bLower) || bLower.includes(aLower)) return { exact: false, partial: true };
    return { exact: false, partial: false };
  };

  // Score each wine for match quality
  type ScoredWine = { wine: Wine; score: number };
  const scoredWines: ScoredWine[] = [];

  for (const wine of wines) {
    let score = 0;

    // Vintage matching (exact only)
    if (extracted.vintage && wine.vintage) {
      if (extracted.vintage === wine.vintage) {
        score += 30; // Exact vintage match is important
      }
    }

    // Producer matching (primary)
    if (extracted.producer && wine.producer) {
      const producerMatch = fuzzyMatch(extracted.producer, wine.producer);
      if (producerMatch.exact) {
        score += 40; // Exact producer match
      } else if (producerMatch.partial) {
        score += 25; // Partial producer match
      }
    }

    // Appellation matching (primary)
    if (extracted.appellation && wine.appellation) {
      const appellationMatch = fuzzyMatch(extracted.appellation, wine.appellation);
      if (appellationMatch.exact) {
        score += 25; // Exact appellation match
      } else if (appellationMatch.partial) {
        score += 15; // Partial appellation match
      }
    }

    // Cru matching (secondary)
    if (extracted.cru && wine.cru) {
      const cruMatch = fuzzyMatch(extracted.cru, wine.cru);
      if (cruMatch.exact) {
        score += 15;
      } else if (cruMatch.partial) {
        score += 10;
      }
    }

    // Vineyard matching (secondary)
    if (extracted.vineyard && wine.vineyard) {
      const vineyardMatch = fuzzyMatch(extracted.vineyard, wine.vineyard);
      if (vineyardMatch.exact) {
        score += 15;
      } else if (vineyardMatch.partial) {
        score += 10;
      }
    }

    // Region matching (bonus)
    if (extracted.region && wine.region) {
      if (wine.region.toLowerCase() === extracted.region.toLowerCase()) {
        score += 5;
      }
    }

    if (score > 0) {
      scoredWines.push({ wine, score });
    }
  }

  if (scoredWines.length === 0) {
    return null;
  }

  // Sort by score descending
  scoredWines.sort((a, b) => b.score - a.score);
  const bestMatch = scoredWines[0];

  // Determine confidence level
  // High: strong match on producer + vintage or producer + appellation (65+)
  // Medium: partial matches (30+)
  const confidence: "high" | "medium" = bestMatch.score >= 65 ? "high" : "medium";

  // Only return matches above a minimum threshold
  if (bestMatch.score < 30) {
    return null;
  }

  return {
    wine: bestMatch.wine,
    confidence,
  };
}
