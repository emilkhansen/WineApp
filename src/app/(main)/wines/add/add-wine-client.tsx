"use client";

import { useState } from "react";
import { Upload, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WineForm, type WineFormReferenceData } from "@/components/wines/wine-form";
import { MultiWineTable } from "@/components/wines/multi-wine-table";
import { ImagePreviewCard } from "@/components/wines/image-preview-card";
import { uploadWineImage } from "@/actions/wines";
import { extractWinesFromImage } from "@/lib/vision";
import { matchExtractedWineToReferences, matchExtractedWinesToReferences } from "@/lib/reference-matcher";
import type { ExtractedWineData, ExtractedWineWithId } from "@/lib/types";
import { toast } from "sonner";

interface AddWineClientProps {
  referenceData: WineFormReferenceData;
}

export function AddWineClient({ referenceData }: AddWineClientProps) {
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
      // Convert image to JPEG first (handles HEIC and other formats)
      let fileToUpload: File | Blob = file;
      let base64: string;
      let mimeType: string;

      try {
        const converted = await convertImageToJpegBase64(file);
        base64 = converted.base64;
        mimeType = converted.mimeType;

        // If conversion happened (not a passthrough), create a new Blob for upload
        if (mimeType === "image/jpeg" && file.type !== "image/jpeg") {
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          fileToUpload = new Blob([byteArray], { type: "image/jpeg" });
        }
      } catch (conversionError) {
        console.error("Image conversion failed:", conversionError);
        toast.error(conversionError instanceof Error ? conversionError.message : "Failed to process image");
        setStep("choose");
        setScanning(false);
        return;
      }

      // Upload converted image
      const uploadResult = await uploadWineImage(fileToUpload);
      if (uploadResult.error) {
        toast.error(`Upload failed: ${uploadResult.error}`);
        setStep("choose");
        setScanning(false);
        return;
      }
      setImageUrl(uploadResult.url);

      // Extract wine data using Claude (supports multiple wines)
      const result = await extractWinesFromImage(base64, mimeType);

      if (result.error) {
        toast.error(result.error);
        // Still proceed to form with image uploaded
        setExtractedData({});
      } else if (result.data && result.data.length > 0) {
        if (result.data.length === 1) {
          // Single wine - match to references and use existing form
          const wine = result.data[0];
          const matchedWine = matchExtractedWineToReferences(
            { ...wine, tempId: "single" },
            referenceData
          );
          setExtractedData({
            producer: matchedWine.producer,
            vintage: matchedWine.vintage,
            region: matchedWine.region,
            grape: matchedWine.grape,
            appellation: matchedWine.appellation,
            vineyard: matchedWine.vineyard,
            cru: matchedWine.cru,
            color: matchedWine.color,
            size: matchedWine.size,
          });
          toast.success("Wine information extracted successfully");
        } else {
          // Multiple wines - match to references and use table view
          const matchedWines = matchExtractedWinesToReferences(result.data, referenceData);
          setExtractedWines(matchedWines);
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

  // Convert any image to JPEG base64 with timeout and fallback (handles HEIC, etc.)
  const convertImageToJpegBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      // For JPEG/PNG/WebP, read directly without conversion
      if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve({ base64, mimeType: file.type });
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
        return;
      }

      // For other formats (HEIC, etc.), try canvas conversion with timeout
      const img = new Image();
      const url = URL.createObjectURL(file);

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        reject(new Error("Image loading timed out. Try using JPEG or PNG format."));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error("Could not get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          const base64 = dataUrl.split(",")[1];
          resolve({ base64, mimeType: "image/jpeg" });
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        reject(new Error("Could not load image. Try using JPEG or PNG format."));
      };

      img.src = url;
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
                  accept="image/*,.heic,.heif"
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
        <MultiWineTable
          wines={extractedWines}
          imageUrl={imageUrl}
          referenceData={referenceData}
        />
      </div>
    );
  }

  // Scan step with split-panel layout for review
  if (step === "scan") {
    return (
      <div className="container py-8 max-w-5xl">
        {/* Header with back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2"
            onClick={() => setStep("choose")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Review Wine Details</h1>
          <p className="text-muted-foreground">
            Verify the extracted information and fill in any missing details
          </p>
        </div>

        {/* Split layout */}
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Left: Image (sticky on desktop, collapsible on mobile) */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <ImagePreviewCard imageUrl={imageUrl} />
          </div>

          {/* Right: Form */}
          <WineForm
            initialData={extractedData || undefined}
            imageUrl={imageUrl}
            showExtractionStatus={true}
            referenceData={referenceData}
          />
        </div>
      </div>
    );
  }

  // Manual entry
  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
          onClick={() => setStep("choose")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Add Wine</h1>
      </div>
      <WineForm referenceData={referenceData} />
    </div>
  );
}
