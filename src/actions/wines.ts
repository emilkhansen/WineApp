"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wine, WineFormData } from "@/lib/types";

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

export async function getWine(id: string): Promise<Wine | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("wines")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching wine:", error);
    return null;
  }

  return data;
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
      name: formData.name,
      producer: formData.producer || null,
      vintage: formData.vintage || null,
      region: formData.region || null,
      grape_variety: formData.grape_variety || null,
      alcohol_percentage: formData.alcohol_percentage || null,
      bottle_size: formData.bottle_size || null,
      appellation: formData.appellation || null,
      importer: formData.importer || null,
      vineyard: formData.vineyard || null,
      winemaker_notes: formData.winemaker_notes || null,
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
      name: formData.name,
      producer: formData.producer || null,
      vintage: formData.vintage || null,
      region: formData.region || null,
      grape_variety: formData.grape_variety || null,
      alcohol_percentage: formData.alcohol_percentage || null,
      bottle_size: formData.bottle_size || null,
      appellation: formData.appellation || null,
      importer: formData.importer || null,
      vineyard: formData.vineyard || null,
      winemaker_notes: formData.winemaker_notes || null,
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
