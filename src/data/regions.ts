export const WINE_REGIONS = [
  // France
  "Bordeaux",
  "Burgundy",
  "Champagne",
  "Loire Valley",
  "Rhône Valley",
  "Alsace",
  "Provence",
  "Languedoc-Roussillon",

  // Italy
  "Tuscany",
  "Piedmont",
  "Veneto",
  "Sicily",
  "Lombardy",
  "Trentino-Alto Adige",

  // Spain
  "Rioja",
  "Ribera del Duero",
  "Priorat",
  "Rías Baixas",
  "Penedès",
  "Jerez",

  // Portugal
  "Douro Valley",
  "Alentejo",
  "Vinho Verde",
  "Dão",

  // Germany
  "Mosel",
  "Rheingau",
  "Pfalz",
  "Baden",

  // Austria
  "Wachau",
  "Burgenland",
  "Styria",

  // USA
  "Napa Valley",
  "Sonoma County",
  "Willamette Valley",
  "Paso Robles",
  "Santa Barbara County",
  "Finger Lakes",

  // Argentina
  "Mendoza",
  "Salta",
  "Patagonia",

  // Chile
  "Maipo Valley",
  "Colchagua Valley",
  "Casablanca Valley",

  // Australia
  "Barossa Valley",
  "Margaret River",
  "Yarra Valley",
  "Hunter Valley",
  "McLaren Vale",

  // New Zealand
  "Marlborough",
  "Central Otago",
  "Hawke's Bay",

  // South Africa
  "Stellenbosch",
  "Franschhoek",
  "Swartland",

  // Other
  "Other",
] as const;

export type WineRegion = typeof WINE_REGIONS[number];
