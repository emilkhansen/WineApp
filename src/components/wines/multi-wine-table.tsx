"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { WINE_REGIONS } from "@/data/regions";
import { WINE_COLORS } from "@/data/colors";
import { WINE_CRUS } from "@/data/crus";
import { createWines } from "@/actions/wines";
import type { ExtractedWineWithId, WineFormData } from "@/lib/types";
import { toast } from "sonner";

interface MultiWineTableProps {
  wines: ExtractedWineWithId[];
  imageUrl?: string;
}

export function MultiWineTable({ wines: initialWines, imageUrl }: MultiWineTableProps) {
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
    // Validate that all wines have names
    const invalidWines = wines.filter((w) => !w.name?.trim());
    if (invalidWines.length > 0) {
      toast.error("All wines must have a name");
      return;
    }

    setSaving(true);

    try {
      const wineFormData: WineFormData[] = wines.map((w) => ({
        name: w.name!,
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
                <TableHead className="min-w-[200px]">Name *</TableHead>
                <TableHead className="min-w-[150px]">Producer</TableHead>
                <TableHead className="w-24">Vintage</TableHead>
                <TableHead className="min-w-[140px]">Region</TableHead>
                <TableHead className="min-w-[160px]">Cru</TableHead>
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
                      aria-label={`Select ${wine.name || "wine"}`}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {wine.position}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={wine.name || ""}
                      onChange={(e) =>
                        handleFieldChange(wine.tempId, "name", e.target.value)
                      }
                      placeholder="Wine name"
                      className="min-w-[180px]"
                    />
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
                    <Select
                      value={wine.region || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "region", value)
                      }
                    >
                      <SelectTrigger className="min-w-[120px]">
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        {WINE_REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={wine.cru || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "cru", value)
                      }
                    >
                      <SelectTrigger className="min-w-[140px]">
                        <SelectValue placeholder="Cru" />
                      </SelectTrigger>
                      <SelectContent>
                        {WINE_CRUS.map((cru) => (
                          <SelectItem key={cru} value={cru}>
                            {cru}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={wine.color || ""}
                      onValueChange={(value) =>
                        handleFieldChange(wine.tempId, "color", value)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Color" />
                      </SelectTrigger>
                      <SelectContent>
                        {WINE_COLORS.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
