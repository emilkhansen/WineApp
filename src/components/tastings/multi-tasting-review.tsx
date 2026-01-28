"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { X, Check, AlertTriangle, CalendarIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ImagePreviewCard } from "@/components/wines/image-preview-card";
import { StarRating } from "@/components/tastings/star-rating";
import { createTastingsFromScan } from "@/actions/tastings";
import type { ScannedWineForTasting, WineFormData } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MultiTastingReviewProps {
  scannedWines: ScannedWineForTasting[];
  imageUrl?: string;
  onCancel: () => void;
}

export function MultiTastingReview({
  scannedWines: initialWines,
  imageUrl,
  onCancel,
}: MultiTastingReviewProps) {
  const router = useRouter();
  const [wines, setWines] = useState<ScannedWineForTasting[]>(initialWines);
  const [saving, setSaving] = useState(false);

  // Shared fields
  const [tastingDate, setTastingDate] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [occasion, setOccasion] = useState("");

  const updateWineRating = (tempId: string, rating: number) => {
    setWines((prev) =>
      prev.map((w) => (w.tempId === tempId ? { ...w, rating } : w))
    );
  };

  const updateWineNotes = (tempId: string, notes: string) => {
    setWines((prev) =>
      prev.map((w) => (w.tempId === tempId ? { ...w, notes } : w))
    );
  };

  const removeWine = (tempId: string) => {
    setWines((prev) => prev.filter((w) => w.tempId !== tempId));
  };

  const handleSave = async () => {
    // Validate all wines have ratings
    const invalidWines = wines.filter((w) => w.rating === 0);
    if (invalidWines.length > 0) {
      toast.error("Please provide a rating for all wines");
      return;
    }

    if (wines.length === 0) {
      toast.error("Please keep at least one wine to create tastings");
      return;
    }

    setSaving(true);

    try {
      const tastingInputs = wines.map((wine) => {
        if (wine.match) {
          return {
            wine_id: wine.match.wine.id,
            rating: wine.rating,
            notes: wine.notes || undefined,
          };
        } else {
          const newWine: WineFormData = {
            name: wine.extracted.name || "Unknown Wine",
            producer: wine.extracted.producer,
            vintage: wine.extracted.vintage,
            region: wine.extracted.region,
            subregion: wine.extracted.subregion,
            grape: wine.extracted.grape,
            appellation: wine.extracted.appellation,
            vineyard: wine.extracted.vineyard,
            cru: wine.extracted.cru,
            color: wine.extracted.color,
            size: wine.extracted.size,
          };
          return {
            newWine,
            rating: wine.rating,
            notes: wine.notes || undefined,
          };
        }
      });

      const result = await createTastingsFromScan(
        tastingInputs,
        {
          tasting_date: format(tastingDate, "yyyy-MM-dd"),
          location: location || undefined,
          occasion: occasion || undefined,
        },
        imageUrl
      );

      if (result.success) {
        toast.success(
          `${wines.length} tasting${wines.length > 1 ? "s" : ""} recorded`
        );
        router.push("/tastings");
      } else {
        toast.error(result.error || "Failed to save tastings");
        setSaving(false);
      }
    } catch {
      toast.error("Failed to save tastings");
      setSaving(false);
    }
  };

  const getWineDisplayName = (wine: ScannedWineForTasting) => {
    const name = wine.extracted.name || "Unknown Wine";
    const vintage = wine.extracted.vintage;
    return vintage ? `${name} (${vintage})` : name;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Left column - Image preview (sticky on desktop) */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <ImagePreviewCard imageUrl={imageUrl} />
      </div>

      {/* Right column - Review form */}
      <div className="space-y-6">
        {/* Shared fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasting Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !tastingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tastingDate ? format(tastingDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tastingDate}
                    onSelect={(date) => date && setTastingDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Location & Occasion */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Home, Restaurant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Input
                  id="occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="e.g., Dinner party, Anniversary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Per-wine cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Wines ({wines.length})
          </h3>

          {wines.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                All wines removed. Click cancel to start over.
              </CardContent>
            </Card>
          ) : (
            wines.map((wine) => (
              <Card key={wine.tempId}>
                <CardContent className="pt-4">
                  {/* Header with name and remove button */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {getWineDisplayName(wine)}
                      </h4>
                      {/* Match status */}
                      {wine.match ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-muted-foreground">
                            Matched: &quot;{wine.match.wine.name}
                            {wine.match.wine.vintage && ` (${wine.match.wine.vintage})`}
                            &quot;
                          </span>
                          <Badge
                            variant={wine.match.confidence === "high" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {wine.match.wine.stock} in stock
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-muted-foreground">
                            New wine will be created (stock: 0)
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeWine(wine.tempId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Rating and Notes */}
                  <div className="grid gap-4 md:grid-cols-[auto_1fr] items-start mt-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label className="text-sm">Rating *</Label>
                      <StarRating
                        rating={wine.rating}
                        onRatingChange={(r) => updateWineRating(wine.tempId, r)}
                        size="md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Notes</Label>
                      <Textarea
                        value={wine.notes}
                        onChange={(e) => updateWineNotes(wine.tempId, e.target.value)}
                        placeholder="Your impressions..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-end sticky bottom-4 bg-background py-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || wines.length === 0 || wines.some((w) => w.rating === 0)}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              `Save ${wines.length} Tasting${wines.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
