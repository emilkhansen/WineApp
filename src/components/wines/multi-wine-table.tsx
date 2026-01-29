"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createWines } from "@/actions/wines";
import type { ExtractedWineWithId, WineFormData } from "@/lib/types";
import type { WineFormReferenceData } from "@/components/wines/wine-form";
import { toast } from "sonner";

interface MultiWineTableProps {
  wines: ExtractedWineWithId[];
  imageUrl?: string;
  referenceData: WineFormReferenceData;
}

export function MultiWineTable({
  wines: initialWines,
  imageUrl,
  referenceData,
}: MultiWineTableProps) {
  const { colors, regions, crus } = referenceData;
  const router = useRouter();
  const [wines, setWines] = useState<ExtractedWineWithId[]>(initialWines);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (
    tempId: string,
    field: keyof ExtractedWineWithId,
    value: string | number | undefined
  ) => {
    setWines((prev) =>
      prev.map((wine) =>
        wine.tempId === tempId ? { ...wine, [field]: value } : wine
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(wines.map((w) => w.tempId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (tempId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(tempId);
      } else {
        next.delete(tempId);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    setWines((prev) => prev.filter((w) => !selectedIds.has(w.tempId)));
    setSelectedIds(new Set());
  };

  const handleDeleteOne = (tempId: string) => {
    setWines((prev) => prev.filter((w) => w.tempId !== tempId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(tempId);
      return next;
    });
  };

  const handleSaveAll = async () => {
    // Validate that all wines have at least producer or appellation
    const invalidWines = wines.filter((w) => !w.producer?.trim() && !w.appellation?.trim());
    if (invalidWines.length > 0) {
      toast.error("All wines must have a producer or appellation");
      return;
    }

    setSaving(true);

    try {
      const wineFormData: WineFormData[] = wines.map((w) => ({
        producer: w.producer,
        vintage: w.vintage,
        region: w.region,
        grape: w.grape,
        appellation: w.appellation,
        vineyard: w.vineyard,
        cru: w.cru,
        color: w.color,
        size: w.size,
        stock: 1,
      }));

      const result = await createWines(wineFormData, imageUrl);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${wines.length} wines added successfully`);
        router.push("/wines");
      }
    } catch {
      toast.error("Failed to save wines");
    } finally {
      setSaving(false);
    }
  };

  const allSelected = wines.length > 0 && selectedIds.size === wines.length;
  const someSelected = selectedIds.size > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Review Detected Wines ({wines.length})</CardTitle>
        <div className="flex gap-2">
          {someSelected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected ({selectedIds.size})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="min-w-[80px]">Position</TableHead>
                <TableHead className="min-w-[150px]">Producer</TableHead>
                <TableHead className="w-24">Vintage</TableHead>
                <TableHead className="min-w-[140px]">Region</TableHead>
                <TableHead className="min-w-[160px]">Appellation</TableHead>
                <TableHead className="min-w-[140px]">Cru</TableHead>
                <TableHead className="w-28">Color</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wines.map((wine) => (
                <TableRow key={wine.tempId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(wine.tempId)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(wine.tempId, checked as boolean)
                      }
                      aria-label={`Select ${wine.producer || "wine"}`}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {wine.position}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={wine.producer || ""}
                      onChange={(e) =>
                        handleFieldChange(wine.tempId, "producer", e.target.value)
                      }
                      placeholder="Producer"
                      className="min-w-[130px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={wine.vintage || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          wine.tempId,
                          "vintage",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="Year"
                      className="w-20"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </TableCell>
                  <TableCell>
                    <Combobox
                      options={regions.map((region) => ({
                        value: region.name,
                        label: region.name,
                      }))}
                      value={wine.region || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "region", value)
                      }
                      placeholder="Region"
                      searchPlaceholder="Search regions..."
                      className="min-w-[120px]"
                    />
                    {wine.originalValues?.region && wine.originalValues.region !== wine.region && (
                      <p className="text-xs text-muted-foreground mt-1 truncate" title={wine.originalValues.region}>
                        AI: {wine.originalValues.region}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={wine.appellation || ""}
                      onChange={(e) =>
                        handleFieldChange(wine.tempId, "appellation", e.target.value)
                      }
                      placeholder="Appellation"
                      className="min-w-[130px]"
                    />
                    {wine.originalValues?.appellation && wine.originalValues.appellation !== wine.appellation && (
                      <p className="text-xs text-muted-foreground mt-1 truncate" title={wine.originalValues.appellation}>
                        AI: {wine.originalValues.appellation}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Combobox
                      options={crus.map((cru) => ({
                        value: cru.name,
                        label: cru.name,
                      }))}
                      value={wine.cru || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "cru", value)
                      }
                      placeholder="Cru"
                      searchPlaceholder="Search crus..."
                      className="min-w-[120px]"
                    />
                    {wine.originalValues?.cru && wine.originalValues.cru !== wine.cru && (
                      <p className="text-xs text-muted-foreground mt-1 truncate" title={wine.originalValues.cru}>
                        AI: {wine.originalValues.cru}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Combobox
                      options={colors.map((color) => ({
                        value: color.name,
                        label: color.name,
                      }))}
                      value={wine.color || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "color", value)
                      }
                      placeholder="Color"
                      searchPlaceholder="Search colors..."
                      className="w-24"
                    />
                    {wine.originalValues?.color && wine.originalValues.color !== wine.color && (
                      <p className="text-xs text-muted-foreground mt-1 truncate" title={wine.originalValues.color}>
                        AI: {wine.originalValues.color}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteOne(wine.tempId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {wines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No wines to save. All wines have been removed.
          </div>
        ) : (
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAll} disabled={saving}>
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Save All ({wines.length} wines)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
