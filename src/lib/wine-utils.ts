import type { Wine } from "./types";

export function getWineDisplayName(
  wine: Pick<Wine, "vintage" | "producer" | "appellation" | "cru" | "vineyard">
): string {
  // Don't show vineyard if it's the same as appellation
  const vineyard = wine.vineyard && wine.vineyard !== wine.appellation
    ? wine.vineyard
    : null;

  const parts = [
    wine.vintage?.toString(),
    wine.producer,
    wine.appellation,
    wine.cru,
    vineyard,
  ].filter(Boolean);

  return parts.join(" ") || "Unnamed Wine";
}
