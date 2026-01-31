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
import { SimpleCombobox } from "@/components/ui/simple-combobox";
import { ImagePreviewCard } from "@/components/wines/image-preview-card";
import { StarRating } from "@/components/tastings/star-rating";
import { FriendSelector } from "@/components/tastings/friend-selector";
import { createTastingsFromScan } from "@/actions/tastings";
import type { ScannedWineForTasting, WineFormData, Wine } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getWineDisplayName } from "@/lib/wine-utils";

interface MultiTastingReviewProps {
  scannedWines: ScannedWineForTasting[];
  wines: Wine[];
  imageUrl?: string;
  onCancel: () => void;
}

export function MultiTastingReview({
  scannedWines: initialWines,
  wines: cellarWines,
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
  const [friendIds, setFriendIds] = useState<string[]>([]);

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

  const updateSelectedWine = (tempId: string, selectedWineId: string | "new" | "not_mine") => {
    setWines((prev) =>
      prev.map((w) => (w.tempId === tempId ? { ...w, selectedWineId } : w))
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
        if (wine.selectedWineId !== "new" && wine.selectedWineId !== "not_mine") {
          // Use existing wine from cellar
          return {
            wine_id: wine.selectedWineId,
            rating: wine.rating,
            notes: wine.notes || undefined,
          };
        } else {
          // Create new wine from extracted data
          const newWine: WineFormData = {
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
            is_mine: wine.selectedWineId !== "not_mine",
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
          friend_ids: friendIds.length > 0 ? friendIds : undefined,
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

  const getScannedWineDisplayName = (wine: ScannedWineForTasting) => {
    // Build display name from extracted components
    const parts = [
      wine.extracted.vintage?.toString(),
      wine.extracted.producer,
      wine.extracted.appellation,
      wine.extracted.cru,
      wine.extracted.vineyard,
    ].filter(Boolean);
    return parts.join(" ") || "Unknown Wine";
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr] overflow-hidden">
      {/* Left column - Image preview (sticky on desktop) */}
      <div className="lg:sticky lg:top-8 lg:self-start min-w-0">
        <ImagePreviewCard imageUrl={imageUrl} />
      </div>

      {/* Right column - Review form */}
      <div className="space-y-6 min-w-0">
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

            {/* Friends */}
            <FriendSelector
              selectedFriendIds={friendIds}
              onFriendsChange={setFriendIds}
            />
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
            wines.map((wine) => {
              const selectedCellarWine = wine.selectedWineId !== "new" && wine.selectedWineId !== "not_mine"
                ? cellarWines.find(w => w.id === wine.selectedWineId)
                : null;

              return (
                <Card key={wine.tempId}>
                  <CardContent className="pt-4">
                    {/* Header with scanned name and remove button */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">Scanned:</p>
                        <h4 className="font-medium truncate">
                          {getScannedWineDisplayName(wine)}
                        </h4>
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

                    {/* Wine selection dropdown */}
                    <div className="space-y-2 mb-4 pt-3 border-t">
                      <Label className="text-sm">Wine</Label>
                      <SimpleCombobox
                        options={[
                          {
                            value: "new",
                            label: "Create new wine",
                            icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
                          },
                          {
                            value: "not_mine",
                            label: "Not my wine",
                            icon: <AlertTriangle className="h-4 w-4 text-blue-600" />,
                          },
                          ...cellarWines.map((cellarWine) => ({
                            value: cellarWine.id,
                            label: getWineDisplayName(cellarWine),
                            badge: (
                              <Badge variant="secondary" className="text-xs">
                                {cellarWine.stock} in stock
                              </Badge>
                            ),
                          })),
                        ]}
                        value={wine.selectedWineId}
                        onValueChange={(value) => updateSelectedWine(wine.tempId, value as string | "new" | "not_mine")}
                        placeholder="Select a wine..."
                        searchPlaceholder="Search wines..."
                        renderValue={(option, value) => {
                          if (value === "new") {
                            return (
                              <span className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                Create new wine
                              </span>
                            );
                          }
                          if (value === "not_mine") {
                            return (
                              <span className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-blue-600" />
                                Not my wine
                              </span>
                            );
                          }
                          if (selectedCellarWine) {
                            return (
                              <span className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                {getWineDisplayName(selectedCellarWine)}
                              </span>
                            );
                          }
                          return "Select a wine...";
                        }}
                      />
                    </div>

                    {/* Rating and Notes */}
                    <div className="grid gap-4 md:grid-cols-[auto_1fr] items-start pt-4 border-t">
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
              );
            })
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
