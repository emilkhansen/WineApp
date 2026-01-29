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
import { convertImageToJpeg, isKnownImageFormat, setDebugLogger } from "@/lib/image-utils";
import { matchExtractedWineToReferences, matchExtractedWinesToReferences } from "@/lib/reference-matcher";
import type { ExtractedWineData, ExtractedWineWithId } from "@/lib/types";
import { toast } from "sonner";

interface AddWineClientProps {
  referenceData: WineFormReferenceData;
}

export function AddWineClient({ referenceData }: AddWineClientProps) {
  const [step, setStep] = useState<"choose" | "scan" | "manual" | "multi">("choose");
  const [scanning, setScanning] = useState(false);
  const [converting, setConverting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedWineData | null>(null);
  const [extractedWines, setExtractedWines] = useState<ExtractedWineWithId[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  // Debug state for mobile troubleshooting
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const logs: string[] = [];
    const addLog = (msg: string) => {
      const entry = `${new Date().toISOString().slice(11,19)} ${msg}`;
      logs.push(entry);
      setDebugLog([...logs]);
    };
    setDebugLogger(addLog);

    addLog(`File: name="${file.name}" type="${file.type}" size=${file.size}`);
    addLog(`isKnownFormat: ${isKnownImageFormat(file)}`);

    setScanning(true);
    setStep("scan");

    try {
      // Convert image to JPEG first (handles HEIC and other formats)
      let fileToUpload: File | Blob = file;
      let base64: string;
      let mimeType: string;

      try {
        // Show converting state for unknown formats (includes HEIC which takes longer)
        if (!isKnownImageFormat(file)) {
          setConverting(true);
          addLog("Starting conversion (unknown format)...");
        } else {
          addLog("Known format, reading directly...");
        }

        const converted = await convertImageToJpeg(file);
        base64 = converted.base64;
        mimeType = converted.mimeType;
        fileToUpload = converted.blob;

        addLog(`Conversion OK: mimeType=${mimeType} base64Len=${base64.length}`);
        setConverting(false);
      } catch (conversionError) {
        setConverting(false);
        const errMsg = conversionError instanceof Error ? conversionError.message : String(conversionError);
        addLog(`CONVERSION ERROR: ${errMsg}`);
        console.error("Image conversion failed:", conversionError);
        toast.error(conversionError instanceof Error ? conversionError.message : "Failed to process image");
        setStep("choose");
        setScanning(false);
        return;
      }

      // Upload converted image using FormData (required for Server Actions)
      addLog("Uploading image to storage...");
      const formData = new FormData();
      formData.append("file", fileToUpload);
      const uploadResult = await uploadWineImage(formData);
      if (uploadResult.error) {
        addLog(`UPLOAD ERROR: ${uploadResult.error}`);
        toast.error(`Upload failed: ${uploadResult.error}`);
        setStep("choose");
        setScanning(false);
        return;
      }
      addLog(`Upload OK: ${uploadResult.url}`);
      setImageUrl(uploadResult.url);

      // Extract wine data using Claude (supports multiple wines)
      addLog("Extracting wine data via Claude API...");
      const result = await extractWinesFromImage(base64, mimeType);

      if (result.error) {
        addLog(`EXTRACTION ERROR: ${result.error}`);
        toast.error(result.error);
        // Still proceed to form with image uploaded
        setExtractedData({});
      } else if (result.data && result.data.length > 0) {
        addLog(`Extraction OK: ${result.data.length} wine(s) found`);
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
      const errMsg = error instanceof Error ? error.message : String(error);
      addLog(`OUTER ERROR: ${errMsg}`);
      console.error("Error processing image:", error);
      toast.error("Failed to process image. You can enter details manually.");
      setExtractedData({});
    } finally {
      setScanning(false);
    }
  };

  if (step === "choose") {
    return (
      <div className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Add Wine</h1>

        {/* Show debug log if there was an error */}
        {debugLog.length > 0 && (
          <Card className="mb-4 border-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Debug Log (last attempt)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-2 bg-muted rounded text-xs font-mono overflow-auto max-h-48">
                {debugLog.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap break-all">{log}</div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setDebugLog([])}
              >
                Clear log
              </Button>
            </CardContent>
          </Card>
        )}

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
            <p className="text-muted-foreground">
              {converting ? "Converting image..." : "Analyzing wine label..."}
            </p>
            {/* Debug log for mobile troubleshooting */}
            {debugLog.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded text-xs font-mono text-left w-full max-w-md overflow-auto max-h-48">
                {debugLog.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap break-all">{log}</div>
                ))}
              </div>
            )}
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
