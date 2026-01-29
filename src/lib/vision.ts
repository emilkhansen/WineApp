"use server";

import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedWineData, ExtractedWineWithId } from "@/lib/types";

export async function extractWineFromImage(
  base64Image: string,
  mimeType: string
): Promise<{ data?: ExtractedWineData; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Pre-flight validation with logging
  console.log("[vision] extractWineFromImage called, base64 length:", base64Image.length);

  if (!apiKey) {
    console.error("[vision] ANTHROPIC_API_KEY is not set");
    return { error: "Anthropic API key not configured" };
  }

  console.log("[vision] API key present, length:", apiKey.length);

  try {
    const anthropic = new Anthropic({ apiKey });
    console.log("[vision] Starting Claude API call...");

    const prompt = `You are an expert French wine sommelier analyzing a wine label. Extract information following French wine conventions.

FRENCH WINE LABEL RULES:
1. PRODUCER: The estate or producer name. Look for "Château X", "Domaine X", "Clos X", or "Mis en bouteille au château/domaine". For négociants, extract the négociant name.

2. APPELLATION: Look for "Appellation [X] Contrôlée" or "AOP [X]" or "AOC [X]". This is the official designation.

3. CRU (CLASSIFICATION): Extract as a SEPARATE field. Look for:
   - Burgundy: "Grand Cru", "Premier Cru" / "1er Cru"
   - Bordeaux: "Premier Grand Cru Classé", "Grand Cru Classé", "Cru Classé", "Cru Bourgeois"
   - Médoc 1855: "Premier Cru", "Deuxième Cru", etc.
   - Alsace: "Alsace Grand Cru"
   - Champagne: "Grand Cru", "Premier Cru"

4. VINEYARD: The specific lieu-dit or vineyard name ONLY (NOT the classification). Examples: "Les Clos", "Clos de Vougeot", "La Tâche"

5. VINTAGE: The 4-digit year prominently displayed.

6. COLOR: Infer from appellation when possible:
   - Sauternes, Barsac = Dessert (sweet white)
   - Champagne = Sparkling
   - Most Burgundy reds = Pinot Noir (Red)
   - If "Rosé" or "Clairet" appears = Rosé
   - Look for "Rouge" (red), "Blanc" (white)

7. GRAPE: Only include if explicitly stated. Many French wines don't list grapes.

8. REGION: Infer from appellation:
   - Margaux, Saint-Émilion, Pauillac, Médoc → Bordeaux
   - Gevrey-Chambertin, Meursault, Chablis → Burgundy
   - Châteauneuf-du-Pape, Côtes du Rhône → Rhône Valley
   - Sancerre, Vouvray, Muscadet → Loire Valley
   - Riesling/Gewurztraminer appellations → Alsace

9. SUBREGION: For the identified region, determine the specific subregion:
   - Bordeaux: Left Bank, Right Bank, Médoc, Saint-Émilion, Pomerol, Graves, Sauternes, etc.
   - Burgundy: Côte de Nuits, Côte de Beaune, Chablis, Côte Chalonnaise, Mâconnais
   - Rhône Valley: Northern Rhône, Southern Rhône
   - Loire Valley: Sancerre, Pouilly-Fumé, Vouvray, Chinon, Muscadet, Anjou
   - Napa Valley: Oakville, Rutherford, Stags Leap, etc.

10. COMMUNE: For Burgundy, extract the village/commune name (e.g., Gevrey-Chambertin, Meursault, Puligny-Montrachet, Vosne-Romanée). This is often part of or same as the appellation for village-level wines.

Return ONLY valid JSON with these fields (use null for fields you cannot determine):
{
  "producer": "the estate/producer/négociant name (Château X, Domaine X, etc.)",
  "vintage": 2020,
  "region": "Bordeaux|Burgundy|Champagne|Loire Valley|Rhône Valley|Alsace|Provence|Languedoc-Roussillon|Beaujolais|Jura|Savoie|Sud-Ouest",
  "subregion": "specific subregion within the region",
  "commune": "village/commune name for Burgundy wines",
  "grape": "only if explicitly stated on label",
  "appellation": "the AOC/AOP designation",
  "vineyard": "specific lieu-dit or vineyard name only",
  "cru": "Grand Cru|Premier Cru|Grand Cru Classé|Cru Bourgeois|etc.",
  "color": "Red|White|Rosé|Sparkling|Dessert",
  "size": "750ml"
}`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5-20251101",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: base64Image,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    console.log("[vision] Claude API response received, stop_reason:", message.stop_reason);

    // Extract text from the response
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return { error: "No text response from Claude" };
    }

    const text = textContent.text;

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { error: "Could not parse wine data from response" };
    }

    const extracted = JSON.parse(jsonMatch[0]) as ExtractedWineData;

    // Clean up null values
    const cleanedData: ExtractedWineData = {};
    for (const [key, value] of Object.entries(extracted)) {
      if (value !== null && value !== undefined && value !== "") {
        cleanedData[key as keyof ExtractedWineData] = value;
      }
    }

    return { data: cleanedData };
  } catch (error) {
    // Log full error details on server
    console.error("[vision] Claude API error details:", {
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error) {
      return { error: `Claude API: ${error.message}` };
    }
    return { error: "Failed to analyze wine label" };
  }
}

export async function extractWinesFromImage(
  base64Image: string,
  mimeType: string
): Promise<{ data?: ExtractedWineWithId[]; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Pre-flight validation with logging
  console.log("[vision] extractWinesFromImage called, base64 length:", base64Image.length);

  if (!apiKey) {
    console.error("[vision] ANTHROPIC_API_KEY is not set");
    return { error: "Anthropic API key not configured" };
  }

  console.log("[vision] API key present, length:", apiKey.length);

  try {
    const anthropic = new Anthropic({ apiKey });
    console.log("[vision] Starting Claude API call...");

    const prompt = `You are an expert French wine sommelier analyzing an image that may contain ONE OR MORE wine bottles/labels. Extract information for ALL visible wines.

IMPORTANT: Count how many distinct wine bottles or labels are visible in the image. Extract data for EACH one.

FRENCH WINE LABEL RULES:
1. PRODUCER: The estate or producer name. Look for "Château X", "Domaine X", "Clos X", or "Mis en bouteille au château/domaine". For négociants, extract the négociant name.

2. APPELLATION: Look for "Appellation [X] Contrôlée" or "AOP [X]" or "AOC [X]".

3. CRU (CLASSIFICATION): Extract as a SEPARATE field. Look for:
   - Burgundy: "Grand Cru", "Premier Cru" / "1er Cru"
   - Bordeaux: "Premier Grand Cru Classé", "Grand Cru Classé", "Cru Classé", "Cru Bourgeois"
   - Médoc 1855: "Premier Cru", "Deuxième Cru", etc.
   - Alsace: "Alsace Grand Cru"

4. VINEYARD: The specific lieu-dit or vineyard name ONLY (NOT the classification).

5. VINTAGE: The 4-digit year prominently displayed.

6. COLOR: Infer from appellation when possible.

7. GRAPE: Only include if explicitly stated.

8. REGION: Infer from appellation.

9. SUBREGION: For the identified region, determine the specific subregion:
   - Bordeaux: Left Bank, Right Bank, Médoc, Saint-Émilion, Pomerol, Graves, Sauternes, etc.
   - Burgundy: Côte de Nuits, Côte de Beaune, Chablis, Côte Chalonnaise, Mâconnais
   - Rhône Valley: Northern Rhône, Southern Rhône
   - Loire Valley: Sancerre, Pouilly-Fumé, Vouvray, Chinon, Muscadet, Anjou
   - Napa Valley: Oakville, Rutherford, Stags Leap, etc.

10. COMMUNE: For Burgundy, extract the village/commune name.

11. POSITION: Describe where this wine is in the image (e.g., "left bottle", "center", "right bottle", "top left", etc.)

Return ONLY valid JSON array with ALL wines found. Even if there's only one wine, return an array.
[
  {
    "position": "left bottle",
    "producer": "estate/producer name (Château X, Domaine X, etc.)",
    "vintage": 2020,
    "region": "Bordeaux|Burgundy|etc.",
    "subregion": "specific subregion",
    "commune": "village/commune name for Burgundy wines",
    "grape": "only if stated",
    "appellation": "AOC/AOP designation",
    "vineyard": "lieu-dit name only",
    "cru": "classification if any",
    "color": "Red|White|Rosé|Sparkling|Dessert",
    "size": "750ml"
  }
]

Use null for fields you cannot determine.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5-20251101",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: base64Image,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    console.log("[vision] Claude API response received, stop_reason:", message.stop_reason);

    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return { error: "No text response from Claude" };
    }

    const text = textContent.text;

    // Parse the JSON array response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return { error: "Could not parse wine data from response" };
    }

    const extracted = JSON.parse(jsonMatch[0]) as Array<ExtractedWineData & { position?: string; cru?: string; subregion?: string; commune?: string }>;

    // Clean up and add temp IDs
    const cleanedWines: ExtractedWineWithId[] = extracted.map((wine, index) => {
      const cleanedWine: ExtractedWineWithId = {
        tempId: `wine-${Date.now()}-${index}`,
        position: wine.position || `Wine ${index + 1}`,
      };

      // Copy over non-null, non-empty values
      if (wine.producer) cleanedWine.producer = wine.producer;
      if (wine.vintage) cleanedWine.vintage = wine.vintage;
      if (wine.region) cleanedWine.region = wine.region;
      if (wine.subregion) cleanedWine.subregion = wine.subregion;
      if (wine.commune) cleanedWine.commune = wine.commune;
      if (wine.grape) cleanedWine.grape = wine.grape;
      if (wine.appellation) cleanedWine.appellation = wine.appellation;
      if (wine.vineyard) cleanedWine.vineyard = wine.vineyard;
      if (wine.cru) cleanedWine.cru = wine.cru;
      if (wine.color) cleanedWine.color = wine.color;
      if (wine.size) cleanedWine.size = wine.size;

      return cleanedWine;
    });

    return { data: cleanedWines };
  } catch (error) {
    // Log full error details on server
    console.error("[vision] Claude API error details:", {
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error) {
      return { error: `Claude API: ${error.message}` };
    }
    return { error: "Failed to analyze wine labels" };
  }
}
