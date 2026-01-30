"use client";

import { useState } from "react";
import { Upload, Loader2, ArrowLeft, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WineForm, type WineFormReferenceData } from "@/components/wines/wine-form";
import { MultiWineTable } from "@/components/wines/multi-wine-table";
import { ImagePreviewCard } from "@/components/wines/image-preview-card";
import { ColumnMapper } from "@/components/wines/column-mapper";
import { uploadWineImage } from "@/actions/wines";
import { convertImageToJpeg, isKnownImageFormat } from "@/lib/image-utils";
import { parseSpreadsheet, type ParsedSpreadsheet } from "@/lib/spreadsheet-utils";
import { matchExtractedWineToReferences, matchExtractedWinesToReferences } from "@/lib/reference-matcher";
import type { ExtractedWineData, ExtractedWineWithId } from "@/lib/types";
import { toast } from "sonner";

interface AddWineClientProps {
  referenceData: WineFormReferenceData;
}

export function AddWineClient({ referenceData }: AddWineClientProps) {
  const [step, setStep] = useState<"choose" | "scan" | "manual" | "multi" | "spreadsheet-mapping">("choose");
  const [scanning, setScanning] = useState(false);
  const [converting, setConverting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedWineData | null>(null);
  const [extractedWines, setExtractedWines] = useState<ExtractedWineWithId[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [spreadsheetData, setSpreadsheetData] = useState<ParsedSpreadsheet | null>(null);

  const handleSpreadsheetUpload = async (file: File) => {
    try {
      const parsed = await parseSpreadsheet(file);
      setSpreadsheetData(parsed);
      setStep("spreadsheet-mapping");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to parse file");
    }
  };

  const handleMappingConfirm = (mapping: Record<string, string>) => {
    if (!spreadsheetData) return;

    const wines: ExtractedWineWithId[] = spreadsheetData.rows.map((row, index) => {
      const wine: Record<string, unknown> = {
        tempId: `import-${Date.now()}-${index}`,
        position: `Row ${index + 2}`, // +2 for header row and 1-indexing
      };

      Object.entries(mapping).forEach(([header, field]) => {
        const value = row[header];
        if (value != null && field) {
          if (field === "vintage" || field === "stock") {
            wine[field] = typeof value === "number" ? value : parseInt(String(value), 10) || undefined;
          } else {
            wine[field] = String(value);
          }
        }
      });

      return wine as unknown as ExtractedWineWithId;
    });

    // Match to references
    const matched = matchExtractedWinesToReferences(wines, referenceData);
    setExtractedWines(matched);
    setSpreadsheetData(null);
    setStep("multi");
    toast.success(`Imported ${wines.length} wines`);
  };

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
        setScanning(false);
        return;
      }

      // Upload converted image using FormData (required for Server Actions)
      const formData = new FormData();
      formData.append("file", fileToUpload);
      const uploadResult = await uploadWineImage(formData);
      if (uploadResult.error) {
        toast.error(`Upload failed: ${uploadResult.error}`);
        setStep("choose");
        setScanning(false);
        return;
      }
      setImageUrl(uploadResult.url);

      // Extract wine data using Claude API route (bypasses Server Component serialization limits)
      const extractResponse = await fetch("/api/extract-wines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64, mimeType }),
      });
      const result = await extractResponse.json();

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

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <label htmlFor="spreadsheet-file" className="cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  Import Spreadsheet
                </CardTitle>
                <CardDescription>
                  Upload CSV or Excel file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  id="spreadsheet-file"
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleSpreadsheetUpload(e.target.files[0])}
                />
                <Button variant="secondary" className="w-full" asChild>
                  <span>Choose File</span>
                </Button>
              </CardContent>
            </label>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "spreadsheet-mapping" && spreadsheetData) {
    return (
      <div className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Import Spreadsheet</h1>
        <ColumnMapper
          headers={spreadsheetData.headers}
          onConfirm={handleMappingConfirm}
          onCancel={() => { setSpreadsheetData(null); setStep("choose"); }}
        />
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
