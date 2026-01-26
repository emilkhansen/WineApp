"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExtractedWineData } from "@/lib/types";

export async function extractWineFromImage(
  base64Image: string,
  mimeType: string
): Promise<{ data?: ExtractedWineData; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { error: "Gemini API key not configured" };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const prompt = `Analyze this wine label image and extract the following information. Return ONLY a valid JSON object with these fields (use null for any field you cannot determine with confidence):

{
  "name": "the wine's name",
  "producer": "the winery or producer name",
  "vintage": 2020,
  "region": "the wine region",
  "grape_variety": "the grape variety or blend",
  "alcohol_percentage": 13.5,
  "bottle_size": "750ml",
  "appellation": "the appellation or classification",
  "importer": "the importer name if visible",
  "vineyard": "specific vineyard name if mentioned",
  "winemaker_notes": "any tasting notes or descriptions visible on the label"
}

Important:
- Only include information you can clearly see on the label
- Use null for fields you cannot determine
- vintage should be a number, not a string
- alcohol_percentage should be a number (e.g., 13.5 not "13.5%")
- Return ONLY the JSON object, no other text or markdown`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
      prompt,
    ]);

    const response = result.response;
    const text = response.text();

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
    console.error("Gemini API error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to analyze wine label" };
  }
}
