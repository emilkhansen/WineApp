import { jsPDF } from "jspdf";
import type { Wine } from "@/lib/types";

// Wine color categories in display order
const COLOR_ORDER = ["Red", "White", "Rosé", "Orange", "Sparkling", "Dessert"];

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

interface WineHierarchy {
  [color: string]: {
    [country: string]: {
      [region: string]: {
        [subregion: string]: {
          [commune: string]: {
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
    const commune = wine.commune || "_none_";
    const cru = wine.cru || "_none_";

    if (!hierarchy[color]) hierarchy[color] = {};
    if (!hierarchy[color][country]) hierarchy[color][country] = {};
    if (!hierarchy[color][country][region]) hierarchy[color][country][region] = {};
    if (!hierarchy[color][country][region][subregion]) hierarchy[color][country][region][subregion] = {};
    if (!hierarchy[color][country][region][subregion][commune]) hierarchy[color][country][region][subregion][commune] = {};
    if (!hierarchy[color][country][region][subregion][commune][cru]) hierarchy[color][country][region][subregion][commune][cru] = [];

    hierarchy[color][country][region][subregion][commune][cru].push(wine);
  }

  // Sort wines within each cru by vintage (youngest first), then producer, then name
  for (const color of Object.keys(hierarchy)) {
    for (const country of Object.keys(hierarchy[color])) {
      for (const region of Object.keys(hierarchy[color][country])) {
        for (const subregion of Object.keys(hierarchy[color][country][region])) {
          for (const commune of Object.keys(hierarchy[color][country][region][subregion])) {
            for (const cru of Object.keys(hierarchy[color][country][region][subregion][commune])) {
              hierarchy[color][country][region][subregion][commune][cru].sort((a, b) => {
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

function formatWineLine(wine: Wine, showCru: boolean): string {
  const parts: string[] = [];

  // Vintage
  if (wine.vintage) {
    parts.push(String(wine.vintage));
  }

  // Producer
  if (wine.producer) {
    parts.push(wine.producer);
  }

  // Appellation (if not already showing as region/cru header context)
  if (wine.appellation) {
    parts.push(wine.appellation);
  }

  // Vineyard / Lieu-dit in citation marks
  if (wine.vineyard) {
    parts.push(`"${wine.vineyard}"`);
  }

  // Cru (only if not shown as header)
  if (showCru && wine.cru) {
    parts.push(wine.cru);
  }

  // Size (only if not standard 750ml)
  if (wine.size && wine.size !== "750ml" && wine.size !== "750 ml" && wine.size !== "Standard") {
    parts.push(`[${wine.size}]`);
  }

  return parts.join("  ");
}

export function generateWineListPdf(wines: Wine[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const wineRowMargin = pageWidth / 6; // ~35mm left padding for wine rows

  let currentY = margin;
  let pageNumber = 1;
  const totalPages: number[] = [];

  // Helper to center text
  const centerText = (text: string, y: number) => {
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Helper to add page number
  const addPageNumber = (pageNum: number, total: number) => {
    doc.setFontSize(8);
    doc.setFont("times", "normal");
    doc.setTextColor(128, 128, 128);
    centerText(`${pageNum} / ${total}`, pageHeight - 8);
    doc.setTextColor(0, 0, 0);
  };

  // Helper to check if we need a new page
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

  // Build hierarchy
  const hierarchy = buildWineHierarchy(wines);

  // Get ordered colors
  const orderedColors = COLOR_ORDER.filter(c => hierarchy[c]);
  for (const color of Object.keys(hierarchy)) {
    if (!COLOR_ORDER.includes(color)) orderedColors.push(color);
  }

  // Render hierarchy
  for (const color of orderedColors) {
    if (!hierarchy[color]) continue;

    checkNewPage(12);

    // Color header (centered, elegant)
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    centerText(color.toUpperCase(), currentY);
    currentY += 3;

    // Decorative line under color
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    const colorTextWidth = doc.getTextWidth(color.toUpperCase());
    const lineStart = (pageWidth - colorTextWidth) / 2 - 10;
    const lineEnd = (pageWidth + colorTextWidth) / 2 + 10;
    doc.line(lineStart, currentY, lineEnd, currentY);
    currentY += 6;

    // Sort countries (France first, then alphabetically)
    const countries = Object.keys(hierarchy[color]).sort((a, b) => {
      if (a === "France") return -1;
      if (b === "France") return 1;
      return a.localeCompare(b);
    });

    for (const country of countries) {
      checkNewPage(10);

      // Country header
      doc.setFontSize(10);
      doc.setFont("times", "bold");
      centerText(country, currentY);
      currentY += 5;

      // Sort regions alphabetically
      const regions = Object.keys(hierarchy[color][country]).sort();

      for (const region of regions) {
        checkNewPage(8);

        // Region header (centered)
        doc.setFontSize(9);
        doc.setFont("times", "italic");
        doc.setTextColor(60, 60, 60);
        centerText(region, currentY);
        doc.setTextColor(0, 0, 0);
        currentY += 4;

        // Sort subregions (put "_none_" last)
        const subregions = Object.keys(hierarchy[color][country][region]).sort((a, b) => {
          if (a === "_none_") return 1;
          if (b === "_none_") return -1;
          return a.localeCompare(b);
        });

        for (const subregion of subregions) {
          const communesBySubregion = hierarchy[color][country][region][subregion];

          // Subregion header (left-aligned with wine rows)
          if (subregion !== "_none_") {
            checkNewPage(6);
            doc.setFontSize(8);
            doc.setFont("times", "bold");
            doc.setTextColor(70, 70, 70);
            doc.text(subregion, wineRowMargin, currentY);
            doc.setTextColor(0, 0, 0);
            currentY += 4;
          }

          // Sort communes (put "_none_" last)
          const communes = Object.keys(communesBySubregion).sort((a, b) => {
            if (a === "_none_") return 1;
            if (b === "_none_") return -1;
            return a.localeCompare(b);
          });

          for (const commune of communes) {
            const crusByCommune = communesBySubregion[commune];

            // Commune header (left-aligned with wine rows)
            if (commune !== "_none_") {
              checkNewPage(5);
              doc.setFontSize(7.5);
              doc.setFont("times", "normal");
              doc.setTextColor(80, 80, 80);
              doc.text(commune, wineRowMargin, currentY);
              doc.setTextColor(0, 0, 0);
              currentY += 3.5;
            }

            // Sort crus (put "_none_" last)
            const crus = Object.keys(crusByCommune).sort((a, b) => {
              if (a === "_none_") return 1;
              if (b === "_none_") return -1;
              return a.localeCompare(b);
            });

            for (const cru of crus) {
              const winesInCru = crusByCommune[cru];
              const showCruInLine = cru === "_none_";

              // Cru header (left-aligned with wine rows)
              if (cru !== "_none_") {
                checkNewPage(5);
                doc.setFontSize(7.5);
                doc.setFont("times", "italic");
                doc.setTextColor(90, 90, 90);
                doc.text(cru, wineRowMargin, currentY);
                doc.setTextColor(0, 0, 0);
                currentY += 3.5;
              }

              // Wines (left-aligned with padding)
              doc.setFontSize(7.5);
              doc.setFont("times", "normal");

              for (const wine of winesInCru) {
                checkNewPage(4);
                const wineLine = formatWineLine(wine, showCruInLine);
                doc.text(wineLine, wineRowMargin, currentY);
                currentY += 3.2;
              }

              currentY += 1.5;
            }

            currentY += 1;
          }

          currentY += 4; // More spacing between subregions
        }

        currentY += 3;
      }

      currentY += 3;
    }

    currentY += 5;
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
