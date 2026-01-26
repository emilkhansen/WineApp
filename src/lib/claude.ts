"use server";

import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedWineData } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function extractWineFromImage(
  base64Image: string,
  mimeType: string
): Promise<{ data?: ExtractedWineData; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "Anthropic API key not configured" };
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Analyze this wine label image and extract the following information. Return ONLY a valid JSON object with these fields (use null for any field you cannot determine with confidence):

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
- Return ONLY the JSON object, no other text`,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return { error: "No text response from Claude" };
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
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
    console.error("Claude API error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to analyze wine label" };
  }
}
