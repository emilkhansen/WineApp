"use client";

import { useState } from "react";
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
import { WINE_REGIONS, getSubregionsForRegion } from "@/data/regions";
import { ALL_GRAPE_VARIETIES } from "@/data/grapes";
import { WINE_COLORS } from "@/data/colors";
import { WINE_CRUS } from "@/data/crus";
import type { Wine, WineFormData } from "@/lib/types";
import { createWine, updateWine } from "@/actions/wines";
import { toast } from "sonner";

interface WineFormProps {
  wine?: Wine;
  initialData?: Partial<WineFormData>;
  imageUrl?: string;
  showExtractionStatus?: boolean;
}

export function WineForm({ wine, initialData, imageUrl, showExtractionStatus }: WineFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WineFormData>({
    name: wine?.name || initialData?.name || "",
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

  const availableSubregions = getSubregionsForRegion(formData.region);

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
        return { ...prev, [field]: value, subregion: "" };
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
              <FieldLabel htmlFor="name" field="name">Wine Name *</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Chateau Margaux"
                required
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="producer" field="producer">Producer</FieldLabel>
              <Input
                id="producer"
                value={formData.producer}
                onChange={(e) => handleChange("producer", e.target.value)}
                placeholder="e.g., Chateau Margaux"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
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
            <div className="space-y-2">
              <FieldLabel htmlFor="color" field="color">Color</FieldLabel>
              <Select
                value={formData.color}
                onValueChange={(value) => handleChange("color", value)}
              >
                <SelectTrigger id="color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {WINE_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="grape" field="grape">Grape</FieldLabel>
              <Select
                value={formData.grape}
                onValueChange={(value) => handleChange("grape", value)}
              >
                <SelectTrigger id="grape">
                  <SelectValue placeholder="Select grape" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_GRAPE_VARIETIES.map((grape) => (
                    <SelectItem key={grape} value={grape}>
                      {grape}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select
                value={formData.region}
                onValueChange={(value) => handleChange("region", value)}
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {WINE_REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {availableSubregions.length > 0 && (
              <div className="space-y-2">
                <FieldLabel htmlFor="subregion" field="subregion">Subregion</FieldLabel>
                <Select
                  value={formData.subregion}
                  onValueChange={(value) => handleChange("subregion", value)}
                >
                  <SelectTrigger id="subregion">
                    <SelectValue placeholder="Select subregion" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubregions.map((subregion) => (
                      <SelectItem key={subregion} value={subregion}>
                        {subregion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="appellation" field="appellation">Appellation</FieldLabel>
              <Input
                id="appellation"
                value={formData.appellation}
                onChange={(e) => handleChange("appellation", e.target.value)}
                placeholder="e.g., AOC Margaux"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="cru" field="cru">Cru Classification</FieldLabel>
              <Select
                value={formData.cru}
                onValueChange={(value) => handleChange("cru", value)}
              >
                <SelectTrigger id="cru">
                  <SelectValue placeholder="Select cru" />
                </SelectTrigger>
                <SelectContent>
                  {WINE_CRUS.map((cru) => (
                    <SelectItem key={cru} value={cru}>
                      {cru}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="vineyard" field="vineyard">Vineyard / Lieu-dit</FieldLabel>
            <Input
              id="vineyard"
              value={formData.vineyard}
              onChange={(e) => handleChange("vineyard", e.target.value)}
              placeholder="e.g., Les Clos, Clos de Vougeot"
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
