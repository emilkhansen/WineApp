"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleCombobox, type SimpleComboboxOption } from "@/components/ui/simple-combobox";
import type {
  Wine,
  WineFormData,
  Color,
  GrapeVarietyRef,
  Region,
  Subregion,
  CruClassification,
  AppellationRef,
  Producer,
  Vineyard,
} from "@/lib/types";
import { createWine, updateWine } from "@/actions/wines";
import { toast } from "sonner";

export interface WineFormReferenceData {
  colors: Color[];
  grapes: GrapeVarietyRef[];
  regions: Region[];
  subregions: Subregion[];
  crus: CruClassification[];
  appellations: AppellationRef[];
  producers: Producer[];
  vineyards: Vineyard[];
}

interface WineFormProps {
  wine?: Wine;
  initialData?: Partial<WineFormData>;
  imageUrl?: string;
  showExtractionStatus?: boolean;
  referenceData: WineFormReferenceData;
}

// Provide default empty arrays for reference data
const defaultReferenceData: WineFormReferenceData = {
  colors: [],
  grapes: [],
  regions: [],
  subregions: [],
  crus: [],
  appellations: [],
  producers: [],
  vineyards: [],
};

export function WineForm({ wine, initialData, imageUrl, showExtractionStatus, referenceData = defaultReferenceData }: WineFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Ensure all reference data arrays exist
  const safeReferenceData = {
    colors: referenceData?.colors ?? [],
    grapes: referenceData?.grapes ?? [],
    regions: referenceData?.regions ?? [],
    subregions: referenceData?.subregions ?? [],
    crus: referenceData?.crus ?? [],
    appellations: referenceData?.appellations ?? [],
    producers: referenceData?.producers ?? [],
    vineyards: referenceData?.vineyards ?? [],
  };

  const [formData, setFormData] = useState<WineFormData>({
    producer: wine?.producer || initialData?.producer || "",
    vintage: wine?.vintage || initialData?.vintage || undefined,
    region: wine?.region || initialData?.region || "",
    subregion: wine?.subregion || initialData?.subregion || "",
    grape: wine?.grape || initialData?.grape || "",
    appellation: wine?.appellation || initialData?.appellation || "",
    vineyard: wine?.vineyard || initialData?.vineyard || "",
    cru: wine?.cru || initialData?.cru || "",
    color: wine?.color || initialData?.color || "",
    size: wine?.size || initialData?.size || "",
    stock: wine?.stock || initialData?.stock || 1,
  });

  // Convert reference data to combobox options
  const colorOptions: SimpleComboboxOption[] = useMemo(
    () => safeReferenceData.colors.map((c) => ({ value: c.name, label: c.name })),
    [safeReferenceData.colors]
  );

  const grapeOptions: SimpleComboboxOption[] = useMemo(
    () =>
      safeReferenceData.grapes.map((g) => ({
        value: g.name,
        label: g.name,
        description: g.color ? `${g.color}` : undefined,
      })),
    [safeReferenceData.grapes]
  );

  const regionOptions: SimpleComboboxOption[] = useMemo(
    () =>
      safeReferenceData.regions.map((r) => ({
        value: r.name,
        label: r.name,
        description: r.country || undefined,
      })),
    [safeReferenceData.regions]
  );

  const subregionOptions: SimpleComboboxOption[] = useMemo(() => {
    // Filter subregions by selected region
    const selectedRegion = safeReferenceData.regions.find((r) => r.name === formData.region);
    if (!selectedRegion) return [];
    return safeReferenceData.subregions
      .filter((s) => s.region_id === selectedRegion.id)
      .map((s) => ({ value: s.name, label: s.name }));
  }, [safeReferenceData.regions, safeReferenceData.subregions, formData.region]);

  const cruOptions: SimpleComboboxOption[] = useMemo(() => {
    // Optionally filter by region if set, otherwise show all
    const selectedRegion = safeReferenceData.regions.find((r) => r.name === formData.region);
    return safeReferenceData.crus
      .filter((c) => !c.region_id || (selectedRegion && c.region_id === selectedRegion.id))
      .map((c) => ({
        value: c.name,
        label: c.name,
        description: c.region?.name,
      }));
  }, [safeReferenceData.regions, safeReferenceData.crus, formData.region]);

  const appellationOptions: SimpleComboboxOption[] = useMemo(() => {
    // Filter by region if set
    const selectedRegion = safeReferenceData.regions.find((r) => r.name === formData.region);
    return safeReferenceData.appellations
      .filter((a) => !a.region_id || (selectedRegion && a.region_id === selectedRegion.id))
      .map((a) => ({
        value: a.name,
        label: a.name,
        description: a.region?.name,
      }));
  }, [safeReferenceData.regions, safeReferenceData.appellations, formData.region]);

  const producerOptions: SimpleComboboxOption[] = useMemo(
    () =>
      safeReferenceData.producers.map((p) => ({
        value: p.name,
        label: p.name,
        description: p.region?.name,
      })),
    [safeReferenceData.producers]
  );

  const vineyardOptions: SimpleComboboxOption[] = useMemo(() => {
    // Filter by region if set
    const selectedRegion = safeReferenceData.regions.find((r) => r.name === formData.region);
    return safeReferenceData.vineyards
      .filter((v) => !v.region_id || (selectedRegion && v.region_id === selectedRegion.id))
      .map((v) => ({
        value: v.name,
        label: v.name,
        description: v.region?.name,
      }));
  }, [safeReferenceData.regions, safeReferenceData.vineyards, formData.region]);

  // Helper to check if a field was extracted from the label
  const isExtracted = (field: keyof WineFormData) => {
    if (!showExtractionStatus || !initialData) return false;
    const value = initialData[field];
    return value !== undefined && value !== "" && value !== null;
  };

  // Count extracted fields
  const extractedCount = showExtractionStatus && initialData
    ? Object.entries(initialData).filter(([, value]) =>
        value !== undefined && value !== "" && value !== null
      ).length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (wine) {
        const result = await updateWine(wine.id, formData);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Wine updated successfully");
          router.push(`/wines/${wine.id}`);
        }
      } else {
        const result = await createWine(formData, imageUrl);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Wine added successfully");
          router.push("/wines");
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof WineFormData, value: string | number | undefined) => {
    setFormData((prev) => {
      // Clear subregion when region changes
      if (field === "region") {
        return { ...prev, region: value as string | undefined, subregion: "" };
      }
      return { ...prev, [field]: value };
    });
  };

  // Helper to render a field label with optional extraction badge
  const FieldLabel = ({ htmlFor, children, field }: { htmlFor: string; children: React.ReactNode; field?: keyof WineFormData }) => (
    <div className="flex items-center gap-2">
      <Label htmlFor={htmlFor}>{children}</Label>
      {field && isExtracted(field) && (
        <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <Check className="h-3 w-3 mr-0.5" />
          Extracted
        </Badge>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Extraction Summary */}
      {showExtractionStatus && (
        <Card className="bg-muted/30 border-green-200 dark:border-green-900/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
              <span className="font-medium">{extractedCount} field{extractedCount !== 1 ? 's' : ''} extracted</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Review and fill in any missing details below
            </p>
          </CardContent>
        </Card>
      )}

      {/* Wine Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Wine Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="producer" field="producer">Producer</FieldLabel>
              <SimpleCombobox
                options={producerOptions}
                value={formData.producer}
                onValueChange={(value) => handleChange("producer", value)}
                placeholder="Select or type producer"
                searchPlaceholder="Search producers..."
                emptyText="No producers found"
                allowCustomValue
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="vintage" field="vintage">Vintage</FieldLabel>
              <Input
                id="vintage"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.vintage || ""}
                onChange={(e) => handleChange("vintage", e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 2019"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="color" field="color">Color</FieldLabel>
              <SimpleCombobox
                options={colorOptions}
                value={formData.color}
                onValueChange={(value) => handleChange("color", value)}
                placeholder="Select color"
                searchPlaceholder="Search colors..."
                emptyText="No colors found"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="grape" field="grape">Grape</FieldLabel>
              <SimpleCombobox
                options={grapeOptions}
                value={formData.grape}
                onValueChange={(value) => handleChange("grape", value)}
                placeholder="Select grape"
                searchPlaceholder="Search grapes..."
                emptyText="No grapes found"
                allowCustomValue
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Origin & Classification */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Origin & Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="region" field="region">Region</FieldLabel>
              <SimpleCombobox
                options={regionOptions}
                value={formData.region}
                onValueChange={(value) => handleChange("region", value)}
                placeholder="Select region"
                searchPlaceholder="Search regions..."
                emptyText="No regions found"
                allowCustomValue
              />
            </div>
            {subregionOptions.length > 0 && (
              <div className="space-y-2">
                <FieldLabel htmlFor="subregion" field="subregion">Subregion</FieldLabel>
                <SimpleCombobox
                  options={subregionOptions}
                  value={formData.subregion}
                  onValueChange={(value) => handleChange("subregion", value)}
                  placeholder="Select subregion"
                  searchPlaceholder="Search subregions..."
                  emptyText="No subregions found"
                  allowCustomValue
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="appellation" field="appellation">Appellation</FieldLabel>
              <SimpleCombobox
                options={appellationOptions}
                value={formData.appellation}
                onValueChange={(value) => handleChange("appellation", value)}
                placeholder="Select or type appellation"
                searchPlaceholder="Search appellations..."
                emptyText="No appellations found"
                allowCustomValue
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="cru" field="cru">Cru Classification</FieldLabel>
              <SimpleCombobox
                options={cruOptions}
                value={formData.cru}
                onValueChange={(value) => handleChange("cru", value)}
                placeholder="Select cru"
                searchPlaceholder="Search crus..."
                emptyText="No crus found"
                allowCustomValue
              />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="vineyard" field="vineyard">Vineyard / Lieu-dit</FieldLabel>
            <SimpleCombobox
              options={vineyardOptions}
              value={formData.vineyard}
              onValueChange={(value) => handleChange("vineyard", value)}
              placeholder="Select or type vineyard"
              searchPlaceholder="Search vineyards..."
              emptyText="No vineyards found"
              allowCustomValue
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="size" field="size">Bottle Size</FieldLabel>
              <Select
                value={formData.size}
                onValueChange={(value) => handleChange("size", value)}
              >
                <SelectTrigger id="size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="375ml">375ml (Half)</SelectItem>
                  <SelectItem value="750ml">750ml (Standard)</SelectItem>
                  <SelectItem value="1.5L">1.5L (Magnum)</SelectItem>
                  <SelectItem value="3L">3L (Double Magnum)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="stock" field="stock">Stock</FieldLabel>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock || 1}
                onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : wine ? "Update Wine" : "Add Wine"}
        </Button>
      </div>
    </form>
  );
}
