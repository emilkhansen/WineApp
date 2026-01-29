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
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StarRating } from "@/components/tastings/star-rating";
import { MultiTastingReview } from "@/components/tastings/multi-tasting-review";
import { createTasting } from "@/actions/tastings";
import { findMatchingWine, uploadWineImage } from "@/actions/wines";
import { convertImageToJpeg, isKnownImageFormat } from "@/lib/image-utils";
import { createClient } from "@/lib/supabase/client";
import type { Wine as WineType, ScannedWineForTasting, ExtractedWineWithId } from "@/lib/types";
import { getWineDisplayName } from "@/lib/wine-utils";
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
  const [converting, setConverting] = useState(false);

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
      .order("producer");

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
      // Convert image to JPEG first (handles HEIC and other formats)
      let fileToUpload: File | Blob = file;
      let base64: string;
      let mimeType: string;

      try {
        // Show converting state for unknown formats (includes HEIC which takes longer)
        if (!isKnownImageFormat(file)) {
          setConverting(true);
        }

        const converted = await convertImageToJpeg(file);
        base64 = converted.base64;
        mimeType = converted.mimeType;
        fileToUpload = converted.blob;

        setConverting(false);
      } catch (conversionError) {
        setConverting(false);
        console.error("Image conversion failed:", conversionError);
        toast.error(conversionError instanceof Error ? conversionError.message : "Failed to process image");
        setStep("choose");
        return;
      }

      // Upload the converted image using FormData (required for Server Actions)
      const formData = new FormData();
      formData.append("file", fileToUpload);
      const uploadResult = await uploadWineImage(formData);
      if (uploadResult.error || !uploadResult.url) {
        toast.error(uploadResult.error || "Failed to upload image");
        setStep("choose");
        return;
      }
      setImageUrl(uploadResult.url);

      // Extract wines from image using API route (avoids Server Action serialization limits)
      const extractResponse = await fetch("/api/extract-wines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64, mimeType }),
      });
      const result = await extractResponse.json();

      if (result.error || !result.data || result.data.length === 0) {
        toast.error(result.error || "No wines detected in the image");
        setStep("choose");
        return;
      }

      // Load wines for the dropdown if not already loaded
      if (wines.length === 0) {
        const supabase = createClient();
        const { data } = await supabase
          .from("wines")
          .select("*")
          .order("producer");
        if (data) {
          setWines(data);
        }
      }

      // Match each extracted wine to user's cellar
      const scannedWithMatches: ScannedWineForTasting[] = await Promise.all(
        result.data.map(async (extractedWithId: ExtractedWineWithId) => {
          const match = await findMatchingWine(extractedWithId);
          // Extract only ExtractedWineData properties (exclude tempId and position)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { tempId, position, ...extracted } = extractedWithId;
          return {
            tempId,
            extracted,
            match,
            selectedWineId: match ? match.wine.id : "new",
            rating: 0,
            notes: "",
          };
        })
      );

      setScannedWines(scannedWithMatches);
      setStep("review");
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
    <div className={cn(
      "container py-8",
      step === "review" ? "max-w-5xl" : "max-w-4xl"
    )}>
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
        accept="image/*,.heic,.heif"
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
            <h3 className="text-lg font-medium mb-2">
              {converting ? "Converting Image" : "Analyzing Wine Label"}
            </h3>
            <p className="text-muted-foreground">
              {converting
                ? "Converting image to a compatible format..."
                : "Extracting wine information from your photo..."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review step (after scanning) */}
      {step === "review" && (
        <>
          {/* Header section */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={handleCancelReview}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-2xl font-bold">Review Tasting Details</h2>
            <p className="text-muted-foreground">
              Confirm wine selections and add your ratings
            </p>
          </div>
          <MultiTastingReview
            scannedWines={scannedWines}
            wines={wines}
            imageUrl={imageUrl}
            onCancel={handleCancelReview}
          />
        </>
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
                  <Combobox
                    options={wines.map((wine) => ({
                      value: wine.id,
                      label: getWineDisplayName(wine),
                    }))}
                    value={wineId}
                    onValueChange={setWineId}
                    placeholder={loadingWines ? "Loading wines..." : "Select a wine"}
                    searchPlaceholder="Search wines..."
                    disabled={loadingWines}
                  />
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
