import { jsPDF } from "jspdf";
import type { Wine } from "@/lib/types";

// Wine color categories in display order (excluding special sections)
const COLOR_ORDER = ["Red", "White", "Rosé", "Orange", "Sparkling"];

// French regions in prestige order (not alphabetical)
const FRENCH_REGION_ORDER = [
  "Burgundy",
  "Bordeaux",
  "Rhône Valley",
  "Loire Valley",
  "Alsace",
  "Beaujolais",
  "Provence",
  "Languedoc-Roussillon",
  "Languedoc",
  "Jura",
  "Savoie",
  "Sud-Ouest",
];

// International countries in order after France
const INTERNATIONAL_COUNTRY_ORDER = [
  "Italy",
  "Spain",
  "Germany",
  "Portugal",
  "USA",
  "Australia",
  "New Zealand",
  "Argentina",
  "Chile",
  "South Africa",
  "Austria",
];

// Burgundy subregions in prestige order
const BURGUNDY_SUBREGION_ORDER = [
  "Chablis",
  "Côte de Nuits",
  "Côte de Beaune",
  "Côte Chalonnaise",
  "Mâconnais",
];

// Bordeaux subregions in prestige order
const BORDEAUX_SUBREGION_ORDER = [
  "Left Bank",
  "Médoc",
  "Haut-Médoc",
  "Margaux",
  "Saint-Julien",
  "Pauillac",
  "Saint-Estèphe",
  "Pessac-Léognan",
  "Graves",
  "Right Bank",
  "Saint-Émilion",
  "Pomerol",
  "Fronsac",
  "Côtes de Bordeaux",
  "Entre-Deux-Mers",
  "Sauternes",
  "Barsac",
];

// Dessert wine indicators (subregions or appellation keywords)
const DESSERT_SUBREGIONS = [
  "Sauternes",
  "Barsac",
];

const DESSERT_APPELLATION_KEYWORDS = [
  "Vendanges Tardives",
  "VT",
  "Sélection de Grains Nobles",
  "SGN",
  "Coteaux du Layon",
  "Bonnezeaux",
  "Quarts de Chaume",
  "Vouvray Moelleux",
  "Montlouis Moelleux",
  "Jurançon",
  "Pacherenc du Vic-Bilh",
  "Monbazillac",
  "Loupiac",
  "Sainte-Croix-du-Mont",
  "Cérons",
  "Cadillac",
  "Recioto",
  "Passito",
  "Vin Santo",
  "Trockenbeerenauslese",
  "TBA",
  "Beerenauslese",
  "BA",
  "Eiswein",
  "Ice Wine",
  "Icewine",
  "Late Harvest",
  "Tokaji",
  "Ausbruch",
];

// Map regions to countries
const REGION_TO_COUNTRY: Record<string, string> = {
  // France
  "Bordeaux": "France",
  "Burgundy": "France",
  "Rhône Valley": "France",
  "Loire Valley": "France",
  "Alsace": "France",
  "Champagne": "France",
  "Provence": "France",
  "Languedoc": "France",
  "Languedoc-Roussillon": "France",
  "Jura": "France",
  "Savoie": "France",
  "Sud-Ouest": "France",
  // Italy
  "Piedmont": "Italy",
  "Tuscany": "Italy",
  "Veneto": "Italy",
  "Sicily": "Italy",
  "Trentino-Alto Adige": "Italy",
  "Friuli-Venezia Giulia": "Italy",
  // Spain
  "Ribera del Duero": "Spain",
  "Rioja": "Spain",
  "Priorat": "Spain",
  "Galicia": "Spain",
  // USA
  "Napa Valley": "USA",
  "Sonoma": "USA",
  "Oregon": "USA",
  "Washington": "USA",
  // Germany
  "Mosel": "Germany",
  "Rheingau": "Germany",
  "Pfalz": "Germany",
  // Other
  "Douro": "Portugal",
  "Mendoza": "Argentina",
  "Barossa Valley": "Australia",
  "Marlborough": "New Zealand",
};

function getCountry(region: string | null): string {
  if (!region) return "Other";
  return REGION_TO_COUNTRY[region] || "Other";
}

// Check if wine is Champagne
function isChampagne(wine: Wine): boolean {
  return wine.region === "Champagne";
}

// Check if wine is a dessert wine
function isDessertWine(wine: Wine): boolean {
  // Explicitly marked as Dessert color
  if (wine.color === "Dessert") return true;

  // Known dessert subregions
  if (wine.subregion && DESSERT_SUBREGIONS.includes(wine.subregion)) return true;

  // Check appellation for dessert wine keywords
  if (wine.appellation) {
    const appellationLower = wine.appellation.toLowerCase();
    for (const keyword of DESSERT_APPELLATION_KEYWORDS) {
      if (appellationLower.includes(keyword.toLowerCase())) return true;
    }
  }

  return false;
}

// Partition wines into special sections
function partitionSpecialWines(wines: Wine[]): {
  champagne: Wine[];
  dessert: Wine[];
  regular: Wine[];
} {
  const champagne: Wine[] = [];
  const dessert: Wine[] = [];
  const regular: Wine[] = [];

  for (const wine of wines) {
    if (isChampagne(wine)) {
      champagne.push(wine);
    } else if (isDessertWine(wine)) {
      dessert.push(wine);
    } else {
      regular.push(wine);
    }
  }

  return { champagne, dessert, regular };
}

// Get sort order for countries (France first, then prestige order, then alphabetical)
function getCountryOrder(country: string): number {
  if (country === "France") return -1;
  const idx = INTERNATIONAL_COUNTRY_ORDER.indexOf(country);
  return idx >= 0 ? idx : 1000; // Unknown countries go last
}

// Get sort order for French regions
function getFrenchRegionOrder(region: string): number {
  const idx = FRENCH_REGION_ORDER.indexOf(region);
  return idx >= 0 ? idx : 1000;
}

// Get sort order for subregions within a region
function getSubregionOrder(region: string, subregion: string): number {
  if (subregion === "_none_") return 9999;

  if (region === "Burgundy") {
    const idx = BURGUNDY_SUBREGION_ORDER.indexOf(subregion);
    return idx >= 0 ? idx : 1000;
  }

  if (region === "Bordeaux") {
    const idx = BORDEAUX_SUBREGION_ORDER.indexOf(subregion);
    return idx >= 0 ? idx : 1000;
  }

  return 0; // Default alphabetical for other regions
}

// Cru display order: Village → Premier Cru → Grand Cru (ascending quality)
const CRU_DISPLAY_ORDER = [
  "Village",
  "Bourgogne",
  "Cru Bourgeois",
  "Cru Bourgeois Supérieur",
  "Cru Bourgeois Exceptionnel",
  "Cru Artisan",
  "Cru du Beaujolais",
  "IGP",
  "Vin de France",
  "Cinquième Cru (1855)",
  "Quatrième Cru (1855)",
  "Troisième Cru (1855)",
  "Deuxième Cru (1855)",
  "Cru Classé",
  "Grand Cru Classé",
  "Premier Cru (1855)",
  "Premier Grand Cru Classé B",
  "Premier Grand Cru Classé A",
  "Premier Cru",
  "Premier Cru (Champagne)",
  "Alsace Grand Cru",
  "Grand Cru",
  "Grand Cru (Champagne)",
];

// Get sort order for crus (ascending quality: Village → Premier Cru → Grand Cru)
function getCruOrder(cru: string): number {
  if (cru === "_none_") return -1; // No cru comes first
  const idx = CRU_DISPLAY_ORDER.indexOf(cru);
  return idx >= 0 ? idx : 500; // Unknown crus in middle
}

// Format cru for inline display (e.g., "Premier Cru" → "1er Cru")
function formatCruInline(cru: string): string {
  if (cru === "Premier Cru" || cru === "Premier Cru (Champagne)") return "1er Cru";
  if (cru === "Grand Cru" || cru === "Grand Cru (Champagne)") return "Grand Cru";
  if (cru === "Alsace Grand Cru") return "Grand Cru";
  // Return as-is for other crus (1855 classifications, etc.)
  return cru;
}

// Size abbreviations for non-standard bottles
const SIZE_ABBREVIATIONS: Record<string, string> = {
  "375ml": "Demi",
  "375 ml": "Demi",
  "Half": "Demi",
  "1.5L": "MG",
  "1.5 L": "MG",
  "Magnum": "MG",
  "3L": "Jéro",
  "3 L": "Jéro",
  "Double Magnum": "Jéro",
};

interface WineHierarchy {
  [color: string]: {
    [country: string]: {
      [region: string]: {
        [subregion: string]: {
          [appellation: string]: {
            [cru: string]: Wine[];
          };
        };
      };
    };
  };
}

function buildWineHierarchy(wines: Wine[]): WineHierarchy {
  const hierarchy: WineHierarchy = {};

  for (const wine of wines) {
    const color = wine.color || "Other";
    const country = getCountry(wine.region);
    const region = wine.region || "Unknown";
    const subregion = wine.subregion || "_none_";
    const appellation = wine.appellation || "_none_";
    const cru = wine.cru || "_none_";

    if (!hierarchy[color]) hierarchy[color] = {};
    if (!hierarchy[color][country]) hierarchy[color][country] = {};
    if (!hierarchy[color][country][region]) hierarchy[color][country][region] = {};
    if (!hierarchy[color][country][region][subregion]) hierarchy[color][country][region][subregion] = {};
    if (!hierarchy[color][country][region][subregion][appellation]) hierarchy[color][country][region][subregion][appellation] = {};
    if (!hierarchy[color][country][region][subregion][appellation][cru]) hierarchy[color][country][region][subregion][appellation][cru] = [];

    hierarchy[color][country][region][subregion][appellation][cru].push(wine);
  }

  // Sort wines within each cru by vintage (youngest first), then producer, then name
  for (const color of Object.keys(hierarchy)) {
    for (const country of Object.keys(hierarchy[color])) {
      for (const region of Object.keys(hierarchy[color][country])) {
        for (const subregion of Object.keys(hierarchy[color][country][region])) {
          for (const appellation of Object.keys(hierarchy[color][country][region][subregion])) {
            for (const cru of Object.keys(hierarchy[color][country][region][subregion][appellation])) {
              hierarchy[color][country][region][subregion][appellation][cru].sort((a, b) => {
                // Sort by vintage descending (youngest first)
                const vintageA = a.vintage || 0;
                const vintageB = b.vintage || 0;
                if (vintageB !== vintageA) return vintageB - vintageA;
                // Then by producer
                const producerCompare = (a.producer || "").localeCompare(b.producer || "");
                if (producerCompare !== 0) return producerCompare;
                // Then by appellation
                return (a.appellation || "").localeCompare(b.appellation || "");
              });
            }
          }
        }
      }
    }
  }

  return hierarchy;
}

interface WineLineResult {
  text: string;
  sizeAbbrev: string | null;
}

function formatWineLine(wine: Wine, appellation?: string): WineLineResult {
  const parts: string[] = [];
  const afterProducer: string[] = [];

  // Vintage
  if (wine.vintage) {
    parts.push(String(wine.vintage));
  }

  // Producer
  if (wine.producer) {
    parts.push(wine.producer);
  }

  // Vineyard / Lieu-dit in citation marks (skip if same as appellation header)
  if (wine.vineyard && wine.vineyard !== appellation) {
    afterProducer.push(`"${wine.vineyard}"`);
  }

  // Cru (always inline, formatted as "1er Cru" or "Grand Cru")
  if (wine.cru) {
    afterProducer.push(formatCruInline(wine.cru));
  }

  // Add dash and after-producer content if any
  if (afterProducer.length > 0) {
    parts.push("-");
    parts.push(...afterProducer);
  }

  // Size abbreviation (only if not standard 750ml)
  let sizeAbbrev: string | null = null;
  if (wine.size && wine.size !== "750ml" && wine.size !== "750 ml" && wine.size !== "Standard") {
    sizeAbbrev = SIZE_ABBREVIATIONS[wine.size] || wine.size;
  }

  return {
    text: parts.join("  "),
    sizeAbbrev,
  };
}

// PDF rendering context passed to helper functions
interface PdfContext {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  wineRowMargin: number;
  currentY: number;
  pageNumber: number;
  totalPages: number[];
  centerText: (text: string, y: number) => void;
  checkNewPage: (neededSpace: number) => boolean;
}

// Build hierarchy for a flat list of wines (used for special sections)
type FlatHierarchy = {
  [country: string]: {
    [region: string]: {
      [subregion: string]: {
        [appellation: string]: {
          [cru: string]: Wine[];
        };
      };
    };
  };
};

function buildFlatHierarchy(wines: Wine[]): FlatHierarchy {
  const hierarchy: FlatHierarchy = {};

  for (const wine of wines) {
    const country = getCountry(wine.region);
    const region = wine.region || "Unknown";
    const subregion = wine.subregion || "_none_";
    const appellation = wine.appellation || "_none_";
    const cru = wine.cru || "_none_";

    if (!hierarchy[country]) hierarchy[country] = {};
    if (!hierarchy[country][region]) hierarchy[country][region] = {};
    if (!hierarchy[country][region][subregion]) hierarchy[country][region][subregion] = {};
    if (!hierarchy[country][region][subregion][appellation]) hierarchy[country][region][subregion][appellation] = {};
    if (!hierarchy[country][region][subregion][appellation][cru]) hierarchy[country][region][subregion][appellation][cru] = [];

    hierarchy[country][region][subregion][appellation][cru].push(wine);
  }

  // Sort wines within each cru
  for (const country of Object.keys(hierarchy)) {
    for (const region of Object.keys(hierarchy[country])) {
      for (const subregion of Object.keys(hierarchy[country][region])) {
        for (const appellation of Object.keys(hierarchy[country][region][subregion])) {
          for (const cru of Object.keys(hierarchy[country][region][subregion][appellation])) {
            hierarchy[country][region][subregion][appellation][cru].sort((a, b) => {
              const vintageA = a.vintage || 0;
              const vintageB = b.vintage || 0;
              if (vintageB !== vintageA) return vintageB - vintageA;
              const producerCompare = (a.producer || "").localeCompare(b.producer || "");
              if (producerCompare !== 0) return producerCompare;
              return (a.appellation || "").localeCompare(b.appellation || "");
            });
          }
        }
      }
    }
  }

  return hierarchy;
}

// Render a section header (e.g., CHAMPAGNE, DESSERT WINES)
function renderSectionHeader(ctx: PdfContext, title: string): void {
  ctx.checkNewPage(12);
  ctx.doc.setFontSize(12);
  ctx.doc.setFont("times", "bold");
  ctx.centerText(title, ctx.currentY);
  ctx.currentY += 3;

  // Decorative line
  ctx.doc.setDrawColor(150, 150, 150);
  ctx.doc.setLineWidth(0.3);
  const textWidth = ctx.doc.getTextWidth(title);
  const lineStart = (ctx.pageWidth - textWidth) / 2 - 10;
  const lineEnd = (ctx.pageWidth + textWidth) / 2 + 10;
  ctx.doc.line(lineStart, ctx.currentY, lineEnd, ctx.currentY);
  ctx.currentY += 6;
}

// Render wines within a flat hierarchy (for special sections like Champagne, Dessert)
function renderFlatHierarchy(ctx: PdfContext, hierarchy: FlatHierarchy, skipCountryHeader: boolean = false): void {
  const countries = Object.keys(hierarchy).sort((a, b) => {
    const orderA = getCountryOrder(a);
    const orderB = getCountryOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });

  for (const country of countries) {
    if (!skipCountryHeader) {
      ctx.checkNewPage(10);
      ctx.doc.setFontSize(10);
      ctx.doc.setFont("times", "bold");
      ctx.centerText(country, ctx.currentY);
      ctx.currentY += 5;
    }

    const regions = Object.keys(hierarchy[country]).sort((a, b) => {
      if (country === "France") {
        const orderA = getFrenchRegionOrder(a);
        const orderB = getFrenchRegionOrder(b);
        if (orderA !== orderB) return orderA - orderB;
      }
      return a.localeCompare(b);
    });

    for (const region of regions) {
      // Skip region header for single-region sections (like Champagne)
      if (!skipCountryHeader || regions.length > 1) {
        ctx.checkNewPage(8);
        ctx.doc.setFontSize(9);
        ctx.doc.setFont("times", "italic");
        ctx.doc.setTextColor(60, 60, 60);
        ctx.centerText(region, ctx.currentY);
        ctx.doc.setTextColor(0, 0, 0);
        ctx.currentY += 4;
      }

      const subregions = Object.keys(hierarchy[country][region]).sort((a, b) => {
        const orderA = getSubregionOrder(region, a);
        const orderB = getSubregionOrder(region, b);
        if (orderA !== orderB) return orderA - orderB;
        return a.localeCompare(b);
      });

      for (const subregion of subregions) {
        const appellationsBySubregion = hierarchy[country][region][subregion];

        if (subregion !== "_none_") {
          ctx.checkNewPage(6);
          ctx.doc.setFontSize(8);
          ctx.doc.setFont("times", "bold");
          ctx.doc.setTextColor(70, 70, 70);
          ctx.doc.text(subregion, ctx.wineRowMargin, ctx.currentY);
          ctx.doc.setTextColor(0, 0, 0);
          ctx.currentY += 4;
        }

        const appellations = Object.keys(appellationsBySubregion).sort((a, b) => {
          if (a === "_none_") return 1;
          if (b === "_none_") return -1;
          return a.localeCompare(b);
        });

        for (const appellation of appellations) {
          const crusByAppellation = appellationsBySubregion[appellation];

          if (appellation !== "_none_") {
            ctx.checkNewPage(5);
            ctx.doc.setFontSize(7.5);
            ctx.doc.setFont("times", "normal");
            ctx.doc.setTextColor(80, 80, 80);
            ctx.doc.text(appellation, ctx.wineRowMargin, ctx.currentY);
            ctx.doc.setTextColor(0, 0, 0);
            ctx.currentY += 3.5;
          }

          // Collect all wines from all crus and sort by cru order, then vintage
          const allWines: Wine[] = [];
          for (const cru of Object.keys(crusByAppellation)) {
            allWines.push(...crusByAppellation[cru]);
          }
          allWines.sort((a, b) => {
            const cruOrderA = getCruOrder(a.cru || "_none_");
            const cruOrderB = getCruOrder(b.cru || "_none_");
            if (cruOrderA !== cruOrderB) return cruOrderA - cruOrderB;
            // Then by vintage descending
            const vintageA = a.vintage || 0;
            const vintageB = b.vintage || 0;
            if (vintageB !== vintageA) return vintageB - vintageA;
            // Then by producer
            return (a.producer || "").localeCompare(b.producer || "");
          });

          ctx.doc.setFontSize(7.5);

          for (const wine of allWines) {
            ctx.checkNewPage(4);
            const { text, sizeAbbrev } = formatWineLine(wine, appellation !== "_none_" ? appellation : undefined);

            // Render main text in normal font
            ctx.doc.setFont("times", "normal");
            ctx.doc.text(text, ctx.wineRowMargin, ctx.currentY);

            // Render size abbreviation in bold if present
            if (sizeAbbrev) {
              const textWidth = ctx.doc.getTextWidth(text + "  ");
              ctx.doc.setFont("times", "bold");
              ctx.doc.text(sizeAbbrev, ctx.wineRowMargin + textWidth, ctx.currentY);
            }

            ctx.currentY += 3.2;
          }

          ctx.currentY += 2.5;
        }

        ctx.currentY += 4;
      }

      ctx.currentY += 3;
    }

    ctx.currentY += 3;
  }

  ctx.currentY += 5;
}

// Render color section with full hierarchy
function renderColorSection(ctx: PdfContext, color: string, hierarchy: WineHierarchy): void {
  if (!hierarchy[color]) return;

  renderSectionHeader(ctx, color.toUpperCase());

  const countries = Object.keys(hierarchy[color]).sort((a, b) => {
    const orderA = getCountryOrder(a);
    const orderB = getCountryOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });

  for (const country of countries) {
    ctx.checkNewPage(10);

    ctx.doc.setFontSize(10);
    ctx.doc.setFont("times", "bold");
    ctx.centerText(country, ctx.currentY);
    ctx.currentY += 5;

    const regions = Object.keys(hierarchy[color][country]).sort((a, b) => {
      if (country === "France") {
        const orderA = getFrenchRegionOrder(a);
        const orderB = getFrenchRegionOrder(b);
        if (orderA !== orderB) return orderA - orderB;
      }
      return a.localeCompare(b);
    });

    for (const region of regions) {
      ctx.checkNewPage(8);

      ctx.doc.setFontSize(9);
      ctx.doc.setFont("times", "italic");
      ctx.doc.setTextColor(60, 60, 60);
      ctx.centerText(region, ctx.currentY);
      ctx.doc.setTextColor(0, 0, 0);
      ctx.currentY += 4;

      const subregions = Object.keys(hierarchy[color][country][region]).sort((a, b) => {
        const orderA = getSubregionOrder(region, a);
        const orderB = getSubregionOrder(region, b);
        if (orderA !== orderB) return orderA - orderB;
        return a.localeCompare(b);
      });

      for (const subregion of subregions) {
        const appellationsBySubregion = hierarchy[color][country][region][subregion];

        if (subregion !== "_none_") {
          ctx.checkNewPage(6);
          ctx.doc.setFontSize(8);
          ctx.doc.setFont("times", "bold");
          ctx.doc.setTextColor(70, 70, 70);
          ctx.doc.text(subregion, ctx.wineRowMargin, ctx.currentY);
          ctx.doc.setTextColor(0, 0, 0);
          ctx.currentY += 4;
        }

        const appellations = Object.keys(appellationsBySubregion).sort((a, b) => {
          if (a === "_none_") return 1;
          if (b === "_none_") return -1;
          return a.localeCompare(b);
        });

        for (const appellation of appellations) {
          const crusByAppellation = appellationsBySubregion[appellation];

          if (appellation !== "_none_") {
            ctx.checkNewPage(5);
            ctx.doc.setFontSize(7.5);
            ctx.doc.setFont("times", "normal");
            ctx.doc.setTextColor(80, 80, 80);
            ctx.doc.text(appellation, ctx.wineRowMargin, ctx.currentY);
            ctx.doc.setTextColor(0, 0, 0);
            ctx.currentY += 3.5;
          }

          // Collect all wines from all crus and sort by cru order, then vintage
          const allWines: Wine[] = [];
          for (const cru of Object.keys(crusByAppellation)) {
            allWines.push(...crusByAppellation[cru]);
          }
          allWines.sort((a, b) => {
            const cruOrderA = getCruOrder(a.cru || "_none_");
            const cruOrderB = getCruOrder(b.cru || "_none_");
            if (cruOrderA !== cruOrderB) return cruOrderA - cruOrderB;
            // Then by vintage descending
            const vintageA = a.vintage || 0;
            const vintageB = b.vintage || 0;
            if (vintageB !== vintageA) return vintageB - vintageA;
            // Then by producer
            return (a.producer || "").localeCompare(b.producer || "");
          });

          ctx.doc.setFontSize(7.5);

          for (const wine of allWines) {
            ctx.checkNewPage(4);
            const { text, sizeAbbrev } = formatWineLine(wine, appellation !== "_none_" ? appellation : undefined);

            // Render main text in normal font
            ctx.doc.setFont("times", "normal");
            ctx.doc.text(text, ctx.wineRowMargin, ctx.currentY);

            // Render size abbreviation in bold if present
            if (sizeAbbrev) {
              const textWidth = ctx.doc.getTextWidth(text + "  ");
              ctx.doc.setFont("times", "bold");
              ctx.doc.text(sizeAbbrev, ctx.wineRowMargin + textWidth, ctx.currentY);
            }

            ctx.currentY += 3.2;
          }

          ctx.currentY += 2.5;
        }

        ctx.currentY += 4;
      }

      ctx.currentY += 3;
    }

    ctx.currentY += 3;
  }

  ctx.currentY += 5;
}

export function generateWineListPdf(wines: Wine[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const wineRowMargin = pageWidth / 6;

  let currentY = margin;
  let pageNumber = 1;
  const totalPages: number[] = [];

  const centerText = (text: string, y: number) => {
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  const addPageNumber = (pageNum: number, total: number) => {
    doc.setFontSize(8);
    doc.setFont("times", "normal");
    doc.setTextColor(128, 128, 128);
    centerText(`${pageNum} / ${total}`, pageHeight - 8);
    doc.setTextColor(0, 0, 0);
  };

  const checkNewPage = (neededSpace: number): boolean => {
    if (currentY + neededSpace > pageHeight - 15) {
      totalPages.push(pageNumber);
      doc.addPage();
      pageNumber++;
      currentY = margin;
      return true;
    }
    return false;
  };

  // Create context object for helper functions
  const ctx: PdfContext = {
    doc,
    pageWidth,
    pageHeight,
    margin,
    wineRowMargin,
    get currentY() { return currentY; },
    set currentY(v) { currentY = v; },
    get pageNumber() { return pageNumber; },
    set pageNumber(v) { pageNumber = v; },
    totalPages,
    centerText,
    checkNewPage,
  };

  // Title
  doc.setFontSize(18);
  doc.setFont("times", "bold");
  centerText("Wine Collection", currentY + 8);
  currentY += 14;

  // Date
  doc.setFontSize(9);
  doc.setFont("times", "italic");
  doc.setTextColor(100, 100, 100);
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  centerText(dateStr, currentY);
  doc.setTextColor(0, 0, 0);
  currentY += 8;

  // Thin divider
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.line(margin + 20, currentY, pageWidth - margin - 20, currentY);
  currentY += 8;

  // Partition wines into special sections
  const { champagne, dessert, regular } = partitionSpecialWines(wines);

  // 1. Render Champagne section first (if any)
  if (champagne.length > 0) {
    renderSectionHeader(ctx, "CHAMPAGNE");
    const champagneHierarchy = buildFlatHierarchy(champagne);
    // Skip country header for Champagne (all French)
    renderFlatHierarchy(ctx, champagneHierarchy, true);
  }

  // 2. Render regular color sections
  const hierarchy = buildWineHierarchy(regular);
  const orderedColors = COLOR_ORDER.filter(c => hierarchy[c]);
  for (const color of Object.keys(hierarchy)) {
    if (!COLOR_ORDER.includes(color) && color !== "Dessert") {
      orderedColors.push(color);
    }
  }

  for (const color of orderedColors) {
    renderColorSection(ctx, color, hierarchy);
  }

  // 3. Render Dessert wines section last (if any)
  if (dessert.length > 0) {
    renderSectionHeader(ctx, "DESSERT WINES");
    const dessertHierarchy = buildFlatHierarchy(dessert);
    renderFlatHierarchy(ctx, dessertHierarchy, false);
  }

  // Add page numbers to all pages
  totalPages.push(pageNumber);
  const numPages = totalPages.length;

  for (let i = 1; i <= numPages; i++) {
    doc.setPage(i);
    addPageNumber(i, numPages);
  }

  // Generate filename with date
  const dateForFilename = today.toISOString().split("T")[0];
  const filename = `wine-list-${dateForFilename}.pdf`;

  // Download the PDF
  doc.save(filename);
}
