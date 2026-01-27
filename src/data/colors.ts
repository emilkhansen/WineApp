export const WINE_COLORS = [
  "Red",
  "White",
  "Rosé",
  "Orange",
  "Sparkling",
  "Dessert",
] as const;

export type WineColor = (typeof WINE_COLORS)[number];
