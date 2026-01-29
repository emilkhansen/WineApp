import type { Wine } from "./types";

export function getWineDisplayName(
  wine: Pick<Wine, "vintage" | "producer" | "appellation" | "cru" | "vineyard">
): string {
  const parts = [
    wine.vintage?.toString(),
    wine.producer,
    wine.appellation,
    wine.cru,
    wine.vineyard,
  ].filter(Boolean);

  return parts.join(" ") || "Unnamed Wine";
}
