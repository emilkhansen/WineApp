import type { ExtractedWineData, ExtractedWineWithId } from "./types";
import type { WineFormReferenceData } from "@/components/wines/wine-form";

/**
 * Normalizes a string for fuzzy matching:
 * - Converts to lowercase
 * - Removes French accents (é→e, ô→o, etc.)
 * - Normalizes whitespace
 */
function normalizeString(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculates a fuzzy match score between an AI-extracted value and a reference value.
 * Returns 0-100 where 100 is an exact match.
 */
function fuzzyScore(aiValue: string, refValue: string): number {
  const ai = normalizeString(aiValue);
  const ref = normalizeString(refValue);

  // Exact match
  if (ai === ref) return 100;

  // One contains the other
  if (ref.includes(ai) || ai.includes(ref)) return 80;

  // One starts with the other
  if (ref.startsWith(ai) || ai.startsWith(ref)) return 60;

  return 0;
}

/**
 * Finds the best matching reference item for an AI-extracted value.
 * Returns null if no match meets the minimum score threshold.
 */
function findBestMatch<T extends { name: string }>(
  aiValue: string | undefined,
  references: T[],
  minScore = 60
): T | null {
  if (!aiValue || !references.length) return null;

  let best: T | null = null;
  let bestScore = 0;

  for (const ref of references) {
    const score = fuzzyScore(aiValue, ref.name);
    if (score > bestScore && score >= minScore) {
      best = ref;
      bestScore = score;
    }
  }

  return best;
}

/**
 * Normalizes appellation names by stripping common suffixes like AOC, AOP, etc.
 */
function normalizeAppellation(value: string): string {
  return value
    .replace(/\s*(AOC|AOP|DOC|DOCG|IGP|IGT)\s*$/i, "")
    .trim();
}

/**
 * Normalizes cru names by standardizing common variations.
 * E.g., "1er Cru" → "Premier Cru"
 */
function normalizeCru(value: string): string {
  return value
    .replace(/\b1er\s+Cru\b/i, "Premier Cru")
    .replace(/\bGrand\s+Cru\s+Classe\b/i, "Grand Cru Classé")
    .trim();
}

/**
 * Normalizes producer names by handling common abbreviations.
 * E.g., "Ch." → "Château", "Dom." → "Domaine"
 */
function normalizeProducer(value: string): string {
  return value
    .replace(/^Ch\.\s*/i, "Château ")
    .replace(/^Dom\.\s*/i, "Domaine ")
    .replace(/^Cht\.\s*/i, "Château ")
    .trim();
}

/**
 * Specialized fuzzy score for appellations that handles AOC/AOP suffixes.
 */
function appellationFuzzyScore(aiValue: string, refValue: string): number {
  const aiNorm = normalizeString(normalizeAppellation(aiValue));
  const refNorm = normalizeString(normalizeAppellation(refValue));

  if (aiNorm === refNorm) return 100;
  if (refNorm.includes(aiNorm) || aiNorm.includes(refNorm)) return 80;
  if (refNorm.startsWith(aiNorm) || aiNorm.startsWith(refNorm)) return 60;

  return 0;
}

/**
 * Specialized fuzzy score for cru classifications.
 */
function cruFuzzyScore(aiValue: string, refValue: string): number {
  const aiNorm = normalizeString(normalizeCru(aiValue));
  const refNorm = normalizeString(normalizeCru(refValue));

  if (aiNorm === refNorm) return 100;
  if (refNorm.includes(aiNorm) || aiNorm.includes(refNorm)) return 80;
  if (refNorm.startsWith(aiNorm) || aiNorm.startsWith(refNorm)) return 60;

  return 0;
}

/**
 * Specialized fuzzy score for producers with abbreviation handling.
 */
function producerFuzzyScore(aiValue: string, refValue: string): number {
  const aiNorm = normalizeString(normalizeProducer(aiValue));
  const refNorm = normalizeString(normalizeProducer(refValue));

  if (aiNorm === refNorm) return 100;
  if (refNorm.includes(aiNorm) || aiNorm.includes(refNorm)) return 80;
  if (refNorm.startsWith(aiNorm) || aiNorm.startsWith(refNorm)) return 60;

  return 0;
}

/**
 * Finds best matching appellation with AOC/AOP normalization.
 */
function findBestAppellation<T extends { name: string }>(
  aiValue: string | undefined,
  references: T[],
  minScore = 60
): T | null {
  if (!aiValue || !references.length) return null;

  let best: T | null = null;
  let bestScore = 0;

  for (const ref of references) {
    const score = appellationFuzzyScore(aiValue, ref.name);
    if (score > bestScore && score >= minScore) {
      best = ref;
      bestScore = score;
    }
  }

  return best;
}

/**
 * Finds best matching cru with normalization.
 */
function findBestCru<T extends { name: string }>(
  aiValue: string | undefined,
  references: T[],
  minScore = 60
): T | null {
  if (!aiValue || !references.length) return null;

  let best: T | null = null;
  let bestScore = 0;

  for (const ref of references) {
    const score = cruFuzzyScore(aiValue, ref.name);
    if (score > bestScore && score >= minScore) {
      best = ref;
      bestScore = score;
    }
  }

  return best;
}

/**
 * Finds best matching producer with abbreviation handling.
 */
function findBestProducer<T extends { name: string }>(
  aiValue: string | undefined,
  references: T[],
  minScore = 60
): T | null {
  if (!aiValue || !references.length) return null;

  let best: T | null = null;
  let bestScore = 0;

  for (const ref of references) {
    const score = producerFuzzyScore(aiValue, ref.name);
    if (score > bestScore && score >= minScore) {
      best = ref;
      bestScore = score;
    }
  }

  return best;
}

/**
 * Matches extracted wine data fields to reference data.
 * Returns a new wine object with matched values and originalValues tracking what the AI originally found.
 */
export function matchExtractedWineToReferences(
  wine: ExtractedWineWithId,
  referenceData: WineFormReferenceData
): ExtractedWineWithId {
  const originalValues: Partial<ExtractedWineData> = {};
  const matchedWine: ExtractedWineWithId = { ...wine };

  // Match region
  if (wine.region) {
    const matchedRegion = findBestMatch(wine.region, referenceData.regions);
    if (matchedRegion && matchedRegion.name !== wine.region) {
      originalValues.region = wine.region;
      matchedWine.region = matchedRegion.name;
    }
  }

  // Match appellation with AOC/AOP normalization
  if (wine.appellation) {
    const matchedAppellation = findBestAppellation(wine.appellation, referenceData.appellations);
    if (matchedAppellation && matchedAppellation.name !== wine.appellation) {
      originalValues.appellation = wine.appellation;
      matchedWine.appellation = matchedAppellation.name;
    }
  }

  // Match cru with normalization
  if (wine.cru) {
    const matchedCru = findBestCru(wine.cru, referenceData.crus);
    if (matchedCru && matchedCru.name !== wine.cru) {
      originalValues.cru = wine.cru;
      matchedWine.cru = matchedCru.name;
    }
  }

  // Match color (exact/close match)
  if (wine.color) {
    const matchedColor = findBestMatch(wine.color, referenceData.colors, 80);
    if (matchedColor && matchedColor.name !== wine.color) {
      originalValues.color = wine.color;
      matchedWine.color = matchedColor.name;
    }
  }

  // Match grape
  if (wine.grape) {
    const matchedGrape = findBestMatch(wine.grape, referenceData.grapes);
    if (matchedGrape && matchedGrape.name !== wine.grape) {
      originalValues.grape = wine.grape;
      matchedWine.grape = matchedGrape.name;
    }
  }

  // Match producer with abbreviation handling
  if (wine.producer) {
    const matchedProducer = findBestProducer(wine.producer, referenceData.producers);
    if (matchedProducer && matchedProducer.name !== wine.producer) {
      originalValues.producer = wine.producer;
      matchedWine.producer = matchedProducer.name;
    }
  }

  // Match vineyard
  if (wine.vineyard) {
    const matchedVineyard = findBestMatch(wine.vineyard, referenceData.vineyards);
    if (matchedVineyard && matchedVineyard.name !== wine.vineyard) {
      originalValues.vineyard = wine.vineyard;
      matchedWine.vineyard = matchedVineyard.name;
    }
  }

  // Only set originalValues if there were any changes
  if (Object.keys(originalValues).length > 0) {
    matchedWine.originalValues = originalValues;
  }

  return matchedWine;
}

/**
 * Matches multiple extracted wines to reference data.
 */
export function matchExtractedWinesToReferences(
  wines: ExtractedWineWithId[],
  referenceData: WineFormReferenceData
): ExtractedWineWithId[] {
  return wines.map((wine) => matchExtractedWineToReferences(wine, referenceData));
}
