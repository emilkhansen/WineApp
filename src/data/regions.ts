export const WINE_REGIONS = [
  // Bordeaux
  "Bordeaux",
  "Bordeaux - Left Bank",
  "Bordeaux - Right Bank",
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

  // Burgundy
  "Burgundy",
  "Côte de Nuits",
  "Côte de Beaune",
  "Chablis",
  "Côte Chalonnaise",
  "Mâconnais",

  // Champagne
  "Champagne",

  // Loire Valley
  "Loire Valley",
  "Sancerre",
  "Pouilly-Fumé",
  "Vouvray",
  "Chinon",
  "Muscadet",
  "Anjou",
  "Savennières",

  // Rhône Valley
  "Rhône Valley",
  "Rhône Valley - Northern",
  "Rhône Valley - Southern",
  "Côte-Rôtie",
  "Hermitage",
  "Crozes-Hermitage",
  "Saint-Joseph",
  "Cornas",
  "Châteauneuf-du-Pape",
  "Gigondas",
  "Vacqueyras",
  "Côtes du Rhône",

  // Alsace
  "Alsace",

  // Provence
  "Provence",
  "Bandol",
  "Cassis",
  "Côtes de Provence",

  // Languedoc-Roussillon
  "Languedoc-Roussillon",
  "Languedoc",
  "Roussillon",
  "Corbières",
  "Minervois",
  "Fitou",

  // Beaujolais
  "Beaujolais",
  "Beaujolais Crus",
  "Morgon",
  "Fleurie",
  "Moulin-à-Vent",

  // Jura
  "Jura",
  "Arbois",
  "Château-Chalon",

  // Savoie
  "Savoie",

  // Sud-Ouest
  "Sud-Ouest",
  "Cahors",
  "Madiran",
  "Bergerac",
  "Jurançon",
  "Gaillac",

  // Other
  "Other",
] as const;

export type WineRegion = typeof WINE_REGIONS[number];
