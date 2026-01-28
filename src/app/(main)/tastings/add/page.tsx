"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Wine, Loader2 } from "lucide-react";
import { format } from "date-fns";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StarRating } from "@/components/tastings/star-rating";
import { MultiTastingReview } from "@/components/tastings/multi-tasting-review";
import { createTasting } from "@/actions/tastings";
import { findMatchingWine, uploadWineImage } from "@/actions/wines";
import { extractWinesFromImage } from "@/lib/vision";
import { createClient } from "@/lib/supabase/client";
import type { Wine as WineType, ScannedWineForTasting, ExtractedWineWithId } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

type Step = "choose" | "scanning" | "review" | "manual";

export default function AddTastingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedWineId = searchParams.get("wine");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step state
  const [step, setStep] = useState<Step>(preselectedWineId ? "manual" : "choose");

  // Wine list for manual selection
  const [wines, setWines] = useState<WineType[]>([]);
  const [loadingWines, setLoadingWines] = useState(false);

  // Scan state
  const [scannedWines, setScannedWines] = useState<ScannedWineForTasting[]>([]);
  const [imageUrl, setImageUrl] = useState<string>();

  // Manual form state
  const [loading, setLoading] = useState(false);
  const [wineId, setWineId] = useState(preselectedWineId || "");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [tastingDate, setTastingDate] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [occasion, setOccasion] = useState("");

  // Load wines when going to manual step
  useEffect(() => {
    if (step === "manual" && wines.length === 0) {
      loadWines();
    }
  }, [step, wines.length]);

  async function loadWines() {
    setLoadingWines(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("wines")
      .select("*")
      .order("name");

    if (data) {
      setWines(data);
    }
    setLoadingWines(false);
  }

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep("scanning");

    try {
      // Upload the image first
      const uploadResult = await uploadWineImage(file);
      if (uploadResult.error || !uploadResult.url) {
        toast.error(uploadResult.error || "Failed to upload image");
        setStep("choose");
        return;
      }
      setImageUrl(uploadResult.url);

      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const mimeType = file.type;

        // Extract wines from image
        const result = await extractWinesFromImage(base64, mimeType);

        if (result.error || !result.data || result.data.length === 0) {
          toast.error(result.error || "No wines detected in the image");
          setStep("choose");
          return;
        }

        // Match each extracted wine to user's cellar
        const scannedWithMatches: ScannedWineForTasting[] = await Promise.all(
          result.data.map(async (extracted: ExtractedWineWithId) => {
            const match = await findMatchingWine(extracted);
            return {
              tempId: extracted.tempId,
              extracted,
              match,
              rating: 0,
              notes: "",
            };
          })
        );

        setScannedWines(scannedWithMatches);
        setStep("review");
      };

      reader.onerror = () => {
        toast.error("Failed to read image file");
        setStep("choose");
      };

      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to process image");
      setStep("choose");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wineId) {
      toast.error("Please select a wine");
      return;
    }

    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setLoading(true);

    const result = await createTasting({
      wine_id: wineId,
      rating,
      notes: notes || undefined,
      tasting_date: format(tastingDate, "yyyy-MM-dd"),
      location: location || undefined,
      occasion: occasion || undefined,
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Tasting recorded successfully");
      router.push("/tastings");
    }
  };

  const handleCancelReview = () => {
    setScannedWines([]);
    setImageUrl(undefined);
    setStep("choose");
  };

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/tastings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add Tasting</h1>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Choose step */}
      {step === "choose" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={handleScanClick}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Scan Wine Label</CardTitle>
              <CardDescription>
                Take a photo of wine labels to automatically extract wine information
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Supports multiple wines in one photo
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setStep("manual")}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
                <Wine className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Select from Cellar</CardTitle>
              <CardDescription>
                Choose a wine from your existing collection
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Quick entry for wines already in your cellar
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scanning step */}
      {step === "scanning" && (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">Analyzing Wine Label</h3>
            <p className="text-muted-foreground">
              Extracting wine information from your photo...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review step (after scanning) */}
      {step === "review" && (
        <MultiTastingReview
          scannedWines={scannedWines}
          imageUrl={imageUrl}
          onCancel={handleCancelReview}
        />
      )}

      {/* Manual step (select from cellar) */}
      {step === "manual" && (
        <>
          {/* Back to choose button if no preselected wine */}
          {!preselectedWineId && (
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setStep("choose")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to options
            </Button>
          )}

          <form onSubmit={handleManualSubmit}>
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Wine Selection */}
                <div className="space-y-2">
                  <Label htmlFor="wine">Wine *</Label>
                  <Select value={wineId} onValueChange={setWineId}>
                    <SelectTrigger id="wine">
                      <SelectValue placeholder={loadingWines ? "Loading wines..." : "Select a wine"} />
                    </SelectTrigger>
                    <SelectContent>
                      {wines.map((wine) => (
                        <SelectItem key={wine.id} value={wine.id}>
                          {wine.name} {wine.vintage && `(${wine.vintage})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {wines.length === 0 && !loadingWines && (
                    <p className="text-sm text-muted-foreground">
                      No wines in your collection.{" "}
                      <Link href="/wines/add" className="text-primary hover:underline">
                        Add a wine first
                      </Link>
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Rating *</Label>
                  <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                </div>

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

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Tasting Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Your impressions, aromas, flavors..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => preselectedWineId ? router.back() : setStep("choose")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !wineId || rating === 0}>
                    {loading ? "Saving..." : "Save Tasting"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </>
      )}
    </div>
  );
}
