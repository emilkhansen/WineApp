"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

const WINE_FIELDS = [
  { value: "", label: "-- Skip --" },
  { value: "producer", label: "Producer" },
  { value: "vintage", label: "Vintage" },
  { value: "region", label: "Region" },
  { value: "subregion", label: "Subregion" },
  { value: "grape", label: "Grape" },
  { value: "appellation", label: "Appellation" },
  { value: "vineyard", label: "Vineyard" },
  { value: "cru", label: "Cru" },
  { value: "color", label: "Color" },
  { value: "size", label: "Size" },
  { value: "stock", label: "Stock" },
] as const;

interface ColumnMapperProps {
  headers: string[];
  onConfirm: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}

export function ColumnMapper({ headers, onConfirm, onCancel }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>(() => {
    // Auto-detect common mappings
    const initial: Record<string, string> = {};
    headers.forEach(header => {
      const normalized = header.toLowerCase().trim();
      const match = WINE_FIELDS.find(f =>
        f.value && (normalized === f.value || normalized.includes(f.value))
      );
      if (match) initial[header] = match.value;
    });
    return initial;
  });

  const handleConfirm = () => {
    // Filter out empty mappings and convert "_skip" back to empty
    const filtered = Object.fromEntries(
      Object.entries(mapping).filter(([, v]) => v !== "" && v !== "_skip")
    );
    onConfirm(filtered);
  };

  const hasMappings = Object.values(mapping).some(v => v !== "" && v !== "_skip");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Map Columns to Wine Fields</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Match your spreadsheet columns to wine fields. Unmapped columns will be skipped.
        </p>

        <div className="space-y-3">
          {headers.map(header => (
            <div key={header} className="flex items-center gap-3">
              <span className="w-40 truncate font-mono text-sm bg-muted px-2 py-1 rounded">
                {header}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select
                value={mapping[header] || "_skip"}
                onValueChange={(value) => setMapping(prev => ({ ...prev, [header]: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {WINE_FIELDS.map(field => (
                    <SelectItem key={field.value || "_skip"} value={field.value || "_skip"}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!hasMappings}>
            Continue with {Object.values(mapping).filter(v => v && v !== "_skip").length} mapped columns
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
