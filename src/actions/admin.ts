"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  Color,
  GrapeVarietyRef,
  Region,
  Subregion,
  CruClassification,
  AppellationRef,
  Producer,
  Vineyard,
} from "@/lib/types";

// Admin Check
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_admin ?? false;
}

// Colors CRUD
export async function getColors(): Promise<Color[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colors")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching colors:", error);
    return [];
  }

  return data || [];
}

export async function createColor(
  name: string,
  sortOrder: number = 0
): Promise<{ data?: Color; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("colors")
    .insert({ name, sort_order: sortOrder })
    .select()
    .single();

  if (error) {
    console.error("Error creating color:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return { data };
}

export async function updateColor(
  id: string,
  name: string,
  sortOrder?: number
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const updateData: { name: string; sort_order?: number } = { name };
  if (sortOrder !== undefined) {
    updateData.sort_order = sortOrder;
  }

  const { error } = await supabase
    .from("colors")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating color:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

export async function deleteColor(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("colors").delete().eq("id", id);

  if (error) {
    console.error("Error deleting color:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

// Grape Varieties CRUD
export async function getGrapeVarieties(): Promise<GrapeVarietyRef[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grape_varieties")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching grape varieties:", error);
    return [];
  }

  return data || [];
}

export async function createGrapeVariety(
  name: string,
  color: string | null
): Promise<{ data?: GrapeVarietyRef; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grape_varieties")
    .insert({ name, color })
    .select()
    .single();

  if (error) {
    console.error("Error creating grape variety:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return { data };
}

export async function updateGrapeVariety(
  id: string,
  name: string,
  color: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("grape_varieties")
    .update({ name, color })
    .eq("id", id);

  if (error) {
    console.error("Error updating grape variety:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

export async function deleteGrapeVariety(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("grape_varieties").delete().eq("id", id);

  if (error) {
    console.error("Error deleting grape variety:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

// Regions CRUD
export async function getRegions(): Promise<Region[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching regions:", error);
    return [];
  }

  return data || [];
}

export async function createRegion(
  name: string,
  country: string | null
): Promise<{ data?: Region; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("regions")
    .insert({ name, country })
    .select()
    .single();

  if (error) {
    console.error("Error creating region:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return { data };
}

export async function updateRegion(
  id: string,
  name: string,
  country: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("regions")
    .update({ name, country })
    .eq("id", id);

  if (error) {
    console.error("Error updating region:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

export async function deleteRegion(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("regions").delete().eq("id", id);

  if (error) {
    console.error("Error deleting region:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

// Subregions CRUD
export async function getSubregions(regionId?: string): Promise<Subregion[]> {
  const supabase = await createClient();
  let query = supabase
    .from("subregions")
    .select("*, region:regions(*)")
    .order("name", { ascending: true });

  if (regionId) {
    query = query.eq("region_id", regionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching subregions:", error);
    return [];
  }

  return data || [];
}

export async function createSubregion(
  name: string,
  regionId: string
): Promise<{ data?: Subregion; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subregions")
    .insert({ name, region_id: regionId })
    .select("*, region:regions(*)")
    .single();

  if (error) {
    console.error("Error creating subregion:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return { data };
}

export async function updateSubregion(
  id: string,
  name: string,
  regionId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("subregions")
    .update({ name, region_id: regionId })
    .eq("id", id);

  if (error) {
    console.error("Error updating subregion:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

export async function deleteSubregion(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("subregions").delete().eq("id", id);

  if (error) {
    console.error("Error deleting subregion:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

// Cru Classifications CRUD
export async function getCruClassifications(): Promise<CruClassification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cru_classifications")
    .select("*, region:regions(*)")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching cru classifications:", error);
    return [];
  }

  return data || [];
}

export async function createCruClassification(
  name: string,
  regionId: string | null
): Promise<{ data?: CruClassification; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cru_classifications")
    .insert({ name, region_id: regionId })
    .select("*, region:regions(*)")
    .single();

  if (error) {
    console.error("Error creating cru classification:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return { data };
}

export async function updateCruClassification(
  id: string,
  name: string,
  regionId: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cru_classifications")
    .update({ name, region_id: regionId })
    .eq("id", id);

  if (error) {
    console.error("Error updating cru classification:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

export async function deleteCruClassification(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("cru_classifications").delete().eq("id", id);

  if (error) {
    console.error("Error deleting cru classification:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

// Appellations CRUD
export async function getAppellations(regionId?: string): Promise<AppellationRef[]> {
  const supabase = await createClient();
  let query = supabase
    .from("appellations")
    .select("*, region:regions(*), subregion:subregions(*)")
    .order("name", { ascending: true });

  if (regionId) {
    query = query.eq("region_id", regionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching appellations:", error);
    return [];
  }

  return data || [];
}

export async function createAppellation(
  name: string,
  regionId: string | null,
  subregionId: string | null
): Promise<{ data?: AppellationRef; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appellations")
    .insert({ name, region_id: regionId, subregion_id: subregionId })
    .select("*, region:regions(*), subregion:subregions(*)")
    .single();

  if (error) {
    console.error("Error creating appellation:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return { data };
}

export async function updateAppellation(
  id: string,
  name: string,
  regionId: string | null,
  subregionId: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("appellations")
    .update({ name, region_id: regionId, subregion_id: subregionId })
    .eq("id", id);

  if (error) {
    console.error("Error updating appellation:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

export async function deleteAppellation(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("appellations").delete().eq("id", id);

  if (error) {
    console.error("Error deleting appellation:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

// Producers CRUD
export async function getProducers(): Promise<Producer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("producers")
    .select("*, region:regions(*)")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching producers:", error);
    return [];
  }

  return data || [];
}

export async function createProducer(
  name: string,
  regionId: string | null
): Promise<{ data?: Producer; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("producers")
    .insert({ name, region_id: regionId })
    .select("*, region:regions(*)")
    .single();

  if (error) {
    console.error("Error creating producer:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return { data };
}

export async function updateProducer(
  id: string,
  name: string,
  regionId: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("producers")
    .update({ name, region_id: regionId })
    .eq("id", id);

  if (error) {
    console.error("Error updating producer:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

export async function deleteProducer(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("producers").delete().eq("id", id);

  if (error) {
    console.error("Error deleting producer:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

// Vineyards CRUD
export async function getVineyards(): Promise<Vineyard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vineyards")
    .select("*, region:regions(*), appellation:appellations(*)")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching vineyards:", error);
    return [];
  }

  return data || [];
}

export async function createVineyard(
  name: string,
  regionId: string | null,
  appellationId: string | null
): Promise<{ data?: Vineyard; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vineyards")
    .insert({ name, region_id: regionId, appellation_id: appellationId })
    .select("*, region:regions(*), appellation:appellations(*)")
    .single();

  if (error) {
    console.error("Error creating vineyard:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return { data };
}

export async function updateVineyard(
  id: string,
  name: string,
  regionId: string | null,
  appellationId: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vineyards")
    .update({ name, region_id: regionId, appellation_id: appellationId })
    .eq("id", id);

  if (error) {
    console.error("Error updating vineyard:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}

export async function deleteVineyard(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("vineyards").delete().eq("id", id);

  if (error) {
    console.error("Error deleting vineyard:", error);
    return { error: error.message };
  }

  revalidatePath("/data-model");
  return {};
}
