"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleCombobox } from "@/components/ui/simple-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const { colors, regions, subregions, grapes, crus, vineyards } = referenceData;
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
        subregion: w.subregion,
        grape: w.grape,
        appellation: w.appellation,
        vineyard: w.vineyard,
        cru: w.cru,
        color: w.color,
        size: w.size,
        stock: w.stock ?? 1,
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
      <CardContent className="px-3">
        <div className="rounded-md border overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 px-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="min-w-[140px] px-1">Producer</TableHead>
                <TableHead className="w-20 px-1">Vintage</TableHead>
                <TableHead className="min-w-[100px] px-1">Region</TableHead>
                <TableHead className="min-w-[120px] px-1">Subregion</TableHead>
                <TableHead className="min-w-[140px] px-1">Appellation</TableHead>
                <TableHead className="min-w-[120px] px-1">Vineyard</TableHead>
                <TableHead className="min-w-[100px] px-1">Cru</TableHead>
                <TableHead className="min-w-[100px] px-1">Grape</TableHead>
                <TableHead className="w-20 px-1">Color</TableHead>
                <TableHead className="w-20 px-1">Size</TableHead>
                <TableHead className="w-14 px-1">Qty</TableHead>
                <TableHead className="w-10 px-1"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wines.map((wine) => (
                <TableRow key={wine.tempId}>
                  <TableCell className="px-2 py-1">
                    <Checkbox
                      checked={selectedIds.has(wine.tempId)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(wine.tempId, checked as boolean)
                      }
                      aria-label={`Select ${wine.producer || "wine"}`}
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <Input
                      value={wine.producer || ""}
                      onChange={(e) =>
                        handleFieldChange(wine.tempId, "producer", e.target.value)
                      }
                      placeholder="Producer"
                      className="h-8 text-xs min-w-[130px]"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
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
                      className="h-8 text-xs w-[72px]"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <SimpleCombobox
                      options={regions.map((region) => ({
                        value: region.name,
                        label: region.name,
                      }))}
                      value={wine.region || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "region", value)
                      }
                      placeholder="Region"
                      searchPlaceholder="Search..."
                      className="min-w-[90px] [&_input]:h-8 [&_input]:text-xs"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <SimpleCombobox
                      options={subregions.map((subregion) => ({
                        value: subregion.name,
                        label: subregion.name,
                      }))}
                      value={wine.subregion || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "subregion", value)
                      }
                      placeholder="Subregion"
                      searchPlaceholder="Search..."
                      className="min-w-[110px] [&_input]:h-8 [&_input]:text-xs"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <Input
                      value={wine.appellation || ""}
                      onChange={(e) =>
                        handleFieldChange(wine.tempId, "appellation", e.target.value)
                      }
                      placeholder="Appellation"
                      className="h-8 text-xs min-w-[130px]"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <SimpleCombobox
                      options={vineyards.map((vineyard) => ({
                        value: vineyard.name,
                        label: vineyard.name,
                      }))}
                      value={wine.vineyard || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "vineyard", value)
                      }
                      placeholder="Vineyard"
                      searchPlaceholder="Search..."
                      className="min-w-[110px] [&_input]:h-8 [&_input]:text-xs"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <SimpleCombobox
                      options={crus.map((cru) => ({
                        value: cru.name,
                        label: cru.name,
                      }))}
                      value={wine.cru || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "cru", value)
                      }
                      placeholder="Cru"
                      searchPlaceholder="Search..."
                      className="min-w-[90px] [&_input]:h-8 [&_input]:text-xs"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <SimpleCombobox
                      options={grapes.map((grape) => ({
                        value: grape.name,
                        label: grape.name,
                      }))}
                      value={wine.grape || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "grape", value)
                      }
                      placeholder="Grape"
                      searchPlaceholder="Search..."
                      className="min-w-[90px] [&_input]:h-8 [&_input]:text-xs"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <SimpleCombobox
                      options={colors.map((color) => ({
                        value: color.name,
                        label: color.name,
                      }))}
                      value={wine.color || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "color", value)
                      }
                      placeholder="Color"
                      searchPlaceholder="Search..."
                      className="w-[75px] [&_input]:h-8 [&_input]:text-xs"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <Select
                      value={wine.size || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "size", value)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs w-[70px]">
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="375ml">375ml</SelectItem>
                        <SelectItem value="750ml">750ml</SelectItem>
                        <SelectItem value="1.5L">1.5L</SelectItem>
                        <SelectItem value="3L">3L</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <Input
                      type="number"
                      value={wine.stock ?? 1}
                      onChange={(e) =>
                        handleFieldChange(
                          wine.tempId,
                          "stock",
                          e.target.value ? parseInt(e.target.value) : 1
                        )
                      }
                      placeholder="Qty"
                      className="h-8 text-xs w-12"
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteOne(wine.tempId)}
                    >
                      <X className="h-3 w-3" />
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
