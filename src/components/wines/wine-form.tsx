"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent } from "@/components/ui/card";
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
}

export function WineForm({ wine, initialData, imageUrl }: WineFormProps) {
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

          <div className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="color">Color</Label>
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="grape">Grape</Label>
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

          {availableSubregions.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subregion">Subregion</Label>
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
            </div>
          )}

          {/* Additional Details */}
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
              <Label htmlFor="cru">Cru Classification</Label>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vineyard">Vineyard / Lieu-dit</Label>
              <Input
                id="vineyard"
                value={formData.vineyard}
                onChange={(e) => handleChange("vineyard", e.target.value)}
                placeholder="e.g., Les Clos, Clos de Vougeot"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Bottle Size</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock || 1}
              onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
              className="w-32"
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
