"use server";

import { createClient } from "@/lib/supabase/server";
import type { WineFormData } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Ensures all reference data entries exist for the given wine form data.
 * Creates new entries for custom values that don't exist in the database.
 * Follows dependency order: region → subregion → appellation → vineyard
 */
export async function ensureReferenceData(formData: WineFormData): Promise<void> {
  const supabase = await createClient();

  // 1. Region (no dependencies)
  let regionId: string | null = null;
  if (formData.region) {
    regionId = await ensureEntity(supabase, "regions", formData.region);
  }

  // 2. Entities with optional region dependency (parallel)
  await Promise.all([
    formData.producer && ensureEntity(supabase, "producers", formData.producer, { region_id: regionId }),
    formData.grape && ensureEntity(supabase, "grape_varieties", formData.grape),
    formData.cru && ensureEntity(supabase, "cru_classifications", formData.cru, { region_id: regionId }),
  ]);

  // 3. Subregion (requires region)
  let subregionId: string | null = null;
  if (formData.subregion && regionId) {
    subregionId = await ensureEntity(supabase, "subregions", formData.subregion, { region_id: regionId });
  }

  // 4. Appellation (optional region/subregion)
  let appellationId: string | null = null;
  if (formData.appellation) {
    appellationId = await ensureEntity(supabase, "appellations", formData.appellation, {
      region_id: regionId,
      subregion_id: subregionId
    });
  }

  // 5. Vineyard (optional region/appellation)
  if (formData.vineyard) {
    await ensureEntity(supabase, "vineyards", formData.vineyard, {
      region_id: regionId,
      appellation_id: appellationId
    });
  }
}

/**
 * Ensures an entity exists in the given table.
 * Returns the entity's ID if found or created, null on failure.
 */
async function ensureEntity(
  supabase: SupabaseClient,
  table: string,
  name: string,
  extraFields?: Record<string, string | null>
): Promise<string | null> {
  // Check if exists
  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  // Insert new entry
  const { data: created, error } = await supabase
    .from(table)
    .insert({ name, ...extraFields })
    .select("id")
    .single();

  if (error) {
    // Handle race condition (duplicate key constraint violation)
    if (error.code === "23505") {
      const { data: retry } = await supabase
        .from(table)
        .select("id")
        .eq("name", name)
        .maybeSingle();
      return retry?.id ?? null;
    }
    console.warn(`Failed to create ${table} entry:`, error.message);
    return null;
  }

  return created?.id ?? null;
}
