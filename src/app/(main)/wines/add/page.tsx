"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WineForm } from "@/components/wines/wine-form";
import { MultiWineTable } from "@/components/wines/multi-wine-table";
import { uploadWineImage } from "@/actions/wines";
import { extractWinesFromImage } from "@/lib/vision";
import type { ExtractedWineData, ExtractedWineWithId } from "@/lib/types";
import { toast } from "sonner";

export default function AddWinePage() {
  const [step, setStep] = useState<"choose" | "scan" | "manual" | "multi">("choose");
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedWineData | null>(null);
  const [extractedWines, setExtractedWines] = useState<ExtractedWineWithId[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setStep("scan");

    try {
      // Upload image first
      const uploadResult = await uploadWineImage(file);
      if (uploadResult.error) {
        toast.error(`Upload failed: ${uploadResult.error}`);
        setStep("choose");
        setScanning(false);
        return;
      }
      setImageUrl(uploadResult.url);

      // Convert file to base64 for Claude API
      const base64 = await fileToBase64(file);

      // Extract wine data using Claude (supports multiple wines)
      const result = await extractWinesFromImage(base64, file.type);

      if (result.error) {
        toast.error(result.error);
        // Still proceed to form with image uploaded
        setExtractedData({});
      } else if (result.data && result.data.length > 0) {
        if (result.data.length === 1) {
          // Single wine - use existing form
          const wine = result.data[0];
          setExtractedData({
            name: wine.name,
            producer: wine.producer,
            vintage: wine.vintage,
            region: wine.region,
            grape: wine.grape,
            appellation: wine.appellation,
            vineyard: wine.vineyard,
            cru: wine.cru,
            color: wine.color,
            size: wine.size,
          });
          toast.success("Wine information extracted successfully");
        } else {
          // Multiple wines - use table view
          setExtractedWines(result.data);
          setStep("multi");
          toast.success(`${result.data.length} wines detected in image`);
          return;
        }
      } else {
        setExtractedData({});
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image. You can enter details manually.");
      setExtractedData({});
    } finally {
      setScanning(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  if (step === "choose") {
    return (
      <div className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Add Wine</h1>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <label htmlFor="wine-image" className="cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Scan Label
                </CardTitle>
                <CardDescription>
                  Upload a photo of the wine label and we&apos;ll extract the details automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  id="wine-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button variant="secondary" className="w-full" asChild>
                  <span>Choose Photo</span>
                </Button>
              </CardContent>
            </label>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStep("manual")}
          >
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
              <CardDescription>
                Enter the wine details yourself
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Enter Manually
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "scan" && scanning) {
    return (
      <div className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Add Wine</h1>
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Analyzing wine label...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "multi") {
    return (
      <div className="container py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Add Multiple Wines</h1>
        <MultiWineTable wines={extractedWines} imageUrl={imageUrl} />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">
        {step === "scan" ? "Review Wine Details" : "Add Wine"}
      </h1>
      <WineForm initialData={extractedData || undefined} imageUrl={imageUrl} />
    </div>
  );
}
