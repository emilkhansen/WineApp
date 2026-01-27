export const WINE_CRUS = [
  // Burgundy hierarchy (top to bottom)
  "Grand Cru",
  "Premier Cru",
  "Village",
  "Bourgogne",

  // Bordeaux classifications
  "Premier Grand Cru Classé A",
  "Premier Grand Cru Classé B",
  "Grand Cru Classé",
  "Cru Classé",

  // Médoc 1855 Classification
  "Premier Cru (1855)",
  "Deuxième Cru (1855)",
  "Troisième Cru (1855)",
  "Quatrième Cru (1855)",
  "Cinquième Cru (1855)",

  // Other Bordeaux
  "Cru Bourgeois Exceptionnel",
  "Cru Bourgeois Supérieur",
  "Cru Bourgeois",
  "Cru Artisan",

  // Alsace
  "Alsace Grand Cru",

  // Beaujolais
  "Cru du Beaujolais",

  // Champagne
  "Grand Cru (Champagne)",
  "Premier Cru (Champagne)",

  // French wine quality tiers
  "IGP",
  "Vin de France",

  // Generic
  "Other",
] as const;

export type WineCru = (typeof WINE_CRUS)[number];
