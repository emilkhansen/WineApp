export const WINE_REGIONS_MAP: Record<string, string[]> = {
  // France
  "Bordeaux": [
    "Left Bank",
    "Right Bank",
    "Médoc",
    "Haut-Médoc",
    "Saint-Estèphe",
    "Pauillac",
    "Saint-Julien",
    "Margaux",
    "Pessac-Léognan",
    "Graves",
    "Sauternes",
    "Barsac",
    "Saint-Émilion",
    "Pomerol",
    "Fronsac",
  ],
  "Burgundy": [
    "Côte de Nuits",
    "Côte de Beaune",
    "Chablis",
    "Côte Chalonnaise",
    "Mâconnais",
  ],
  "Champagne": [],
  "Loire Valley": [
    "Sancerre",
    "Pouilly-Fumé",
    "Vouvray",
    "Chinon",
    "Muscadet",
    "Anjou",
    "Savennières",
  ],
  "Rhône Valley": [
    "Northern Rhône",
    "Southern Rhône",
    "Côte-Rôtie",
    "Hermitage",
    "Crozes-Hermitage",
    "Saint-Joseph",
    "Cornas",
    "Châteauneuf-du-Pape",
    "Gigondas",
    "Vacqueyras",
    "Côtes du Rhône",
  ],
  "Alsace": [],
  "Provence": [
    "Bandol",
    "Cassis",
    "Côtes de Provence",
  ],
  "Languedoc-Roussillon": [
    "Languedoc",
    "Roussillon",
    "Corbières",
    "Minervois",
    "Fitou",
  ],
  "Beaujolais": [
    "Beaujolais Crus",
    "Morgon",
    "Fleurie",
    "Moulin-à-Vent",
  ],
  "Jura": [
    "Arbois",
    "Château-Chalon",
  ],
  "Savoie": [],
  "Sud-Ouest": [
    "Cahors",
    "Madiran",
    "Bergerac",
    "Jurançon",
    "Gaillac",
  ],

  // Italy
  "Tuscany": [
    "Chianti",
    "Chianti Classico",
    "Brunello di Montalcino",
    "Vino Nobile di Montepulciano",
    "Bolgheri",
  ],
  "Piedmont": [
    "Barolo",
    "Barbaresco",
    "Langhe",
    "Roero",
  ],
  "Veneto": [
    "Valpolicella",
    "Amarone",
    "Soave",
    "Prosecco",
  ],

  // Spain
  "Rioja": [
    "Rioja Alta",
    "Rioja Alavesa",
    "Rioja Oriental",
  ],
  "Ribera del Duero": [],
  "Priorat": [],

  // USA
  "Napa Valley": [
    "Oakville",
    "Rutherford",
    "Stags Leap",
    "Howell Mountain",
    "Calistoga",
  ],
  "Sonoma": [
    "Russian River Valley",
    "Sonoma Coast",
    "Alexander Valley",
    "Dry Creek Valley",
  ],
  "Oregon": [
    "Willamette Valley",
    "Dundee Hills",
  ],

  // Germany
  "Mosel": [],
  "Rheingau": [],
  "Pfalz": [],

  // Other
  "Other": [],
};

export const WINE_REGIONS = Object.keys(WINE_REGIONS_MAP);

export type WineRegion = (typeof WINE_REGIONS)[number];

export function getSubregionsForRegion(region: string | undefined): string[] {
  if (!region) return [];
  return WINE_REGIONS_MAP[region] || [];
}
