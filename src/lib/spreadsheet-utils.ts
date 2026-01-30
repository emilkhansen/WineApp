import * as XLSX from "xlsx";

export interface ParsedSpreadsheet {
  headers: string[];
  rows: Record<string, string | number | null>[];
}

export function parseSpreadsheet(file: File): Promise<ParsedSpreadsheet> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { header: 1 });

        if (jsonData.length < 2) {
          reject(new Error("File must have headers and at least one data row"));
          return;
        }

        const headers = (jsonData[0] as unknown as string[]).map(h => String(h || "").trim());
        const rows = jsonData.slice(1).map(row => {
          const obj: Record<string, string | number | null> = {};
          headers.forEach((header, i) => {
            const value = (row as unknown as unknown[])[i];
            obj[header] = value != null ? value as string | number : null;
          });
          return obj;
        }).filter(row => Object.values(row).some(v => v != null)); // Skip empty rows

        resolve({ headers, rows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}
