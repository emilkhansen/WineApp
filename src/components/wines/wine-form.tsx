"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { WINE_REGIONS } from "@/data/regions";
import { ALL_GRAPE_VARIETIES } from "@/data/grapes";
import type { Wine, WineFormData } from "@/lib/types";
import { createWine, updateWine } from "@/actions/wines";
import { toast } from "sonner";

interface WineFormProps {
  wine?: Wine;
  initialData?: Partial<WineFormData>;
  imageUrl?: string;
}

export function WineForm({ wine, initialData, imageUrl }: WineFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WineFormData>({
    name: wine?.name || initialData?.name || "",
    producer: wine?.producer || initialData?.producer || "",
    vintage: wine?.vintage || initialData?.vintage || undefined,
    region: wine?.region || initialData?.region || "",
    grape_variety: wine?.grape_variety || initialData?.grape_variety || "",
    alcohol_percentage: wine?.alcohol_percentage || initialData?.alcohol_percentage || undefined,
    bottle_size: wine?.bottle_size || initialData?.bottle_size || "",
    appellation: wine?.appellation || initialData?.appellation || "",
    importer: wine?.importer || initialData?.importer || "",
    vineyard: wine?.vineyard || initialData?.vineyard || "",
    winemaker_notes: wine?.winemaker_notes || initialData?.winemaker_notes || "",
    stock: wine?.stock || initialData?.stock || 1,
  });

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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Wine Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Château Margaux"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="producer">Producer</Label>
              <Input
                id="producer"
                value={formData.producer}
                onChange={(e) => handleChange("producer", e.target.value)}
                placeholder="e.g., Château Margaux"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="vintage">Vintage</Label>
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
              <Label htmlFor="region">Region</Label>
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
            <div className="space-y-2">
              <Label htmlFor="grape_variety">Grape Variety</Label>
              <Select
                value={formData.grape_variety}
                onValueChange={(value) => handleChange("grape_variety", value)}
              >
                <SelectTrigger id="grape_variety">
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

          {/* Additional Details */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="alcohol_percentage">Alcohol %</Label>
              <Input
                id="alcohol_percentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.alcohol_percentage || ""}
                onChange={(e) => handleChange("alcohol_percentage", e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="e.g., 13.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bottle_size">Bottle Size</Label>
              <Select
                value={formData.bottle_size}
                onValueChange={(value) => handleChange("bottle_size", value)}
              >
                <SelectTrigger id="bottle_size">
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
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock || 1}
                onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appellation">Appellation</Label>
              <Input
                id="appellation"
                value={formData.appellation}
                onChange={(e) => handleChange("appellation", e.target.value)}
                placeholder="e.g., AOC Margaux"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vineyard">Vineyard</Label>
              <Input
                id="vineyard"
                value={formData.vineyard}
                onChange={(e) => handleChange("vineyard", e.target.value)}
                placeholder="e.g., Grand Cru Classé"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="importer">Importer</Label>
            <Input
              id="importer"
              value={formData.importer}
              onChange={(e) => handleChange("importer", e.target.value)}
              placeholder="e.g., Wine Imports Inc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="winemaker_notes">Winemaker Notes</Label>
            <Textarea
              id="winemaker_notes"
              value={formData.winemaker_notes}
              onChange={(e) => handleChange("winemaker_notes", e.target.value)}
              placeholder="Notes from the producer or back label..."
              rows={3}
            />
          </div>

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
        </CardContent>
      </Card>
    </form>
  );
}
