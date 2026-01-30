"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, ArrowLeft, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WineForm, type WineFormReferenceData } from "@/components/wines/wine-form";
import { MultiWineTable } from "@/components/wines/multi-wine-table";
import { ImagePreviewCard } from "@/components/wines/image-preview-card";
import { uploadWineImage } from "@/actions/wines";
import { convertImageToJpeg, isKnownImageFormat } from "@/lib/image-utils";
import { extractPdfPages } from "@/lib/pdf-utils";
import { matchExtractedWineToReferences, matchExtractedWinesToReferences } from "@/lib/reference-matcher";
import type { ExtractedWineData, ExtractedWineWithId } from "@/lib/types";
import { toast } from "sonner";

interface AddWineClientProps {
  referenceData: WineFormReferenceData;
}

export function AddWineClient({ referenceData }: AddWineClientProps) {
  const [step, setStep] = useState<"choose" | "scan" | "manual" | "multi" | "pdf">("choose");
  const [scanning, setScanning] = useState(false);
  const [converting, setConverting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedWineData | null>(null);
  const [extractedWines, setExtractedWines] = useState<ExtractedWineWithId[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  // PDF processing state
  const [pdfProgress, setPdfProgress] = useState<{
    currentPage: number;
    totalPages: number;
    winesFound: number;
  } | null>(null);
  const pdfCancelledRef = useRef(false);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePdfUpload = async (file: File) => {
    // Check file size (warn if > 15MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 15) {
      toast.warning(`Large PDF (${fileSizeMB.toFixed(1)}MB). Processing may take a while.`);
    }

    setStep("pdf");
    pdfCancelledRef.current = false;
    setPdfProgress({ currentPage: 0, totalPages: 0, winesFound: 0 });

    const allWines: ExtractedWineWithId[] = [];

    try {
      for await (const page of extractPdfPages(file)) {
        // Check if cancelled
        if (pdfCancelledRef.current) {
          break;
        }

        setPdfProgress({
          currentPage: page.pageNum,
          totalPages: page.totalPages,
          winesFound: allWines.length,
        });

        try {
          // Use existing extraction endpoint
          const response = await fetch("/api/extract-wines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base64Image: page.dataUrl.split(",")[1],
              mimeType: "image/jpeg",
            }),
          });

          const result = await response.json();
          if (result.data) {
            // Add page number to position for clarity
            const winesWithPage = result.data.map((w: ExtractedWineWithId) => ({
              ...w,
              tempId: `wine-${Date.now()}-${page.pageNum}-${Math.random().toString(36).slice(2, 7)}`,
              position: `Page ${page.pageNum}${w.position ? ` - ${w.position}` : ""}`,
            }));
            allWines.push(...winesWithPage);
          }
        } catch (pageError) {
          console.error(`Error processing page ${page.pageNum}:`, pageError);
          // Continue processing other pages
        }
      }

      if (pdfCancelledRef.current) {
        toast.info("PDF processing cancelled");
        setStep("choose");
        setPdfProgress(null);
        return;
      }

      if (allWines.length === 0) {
        toast.error("No wines found in PDF");
        setStep("choose");
        setPdfProgress(null);
        return;
      }

      // Match to references and show in multi-wine table
      const matched = matchExtractedWinesToReferences(allWines, referenceData);
      setExtractedWines(matched);
      setStep("multi");
      toast.success(`Found ${allWines.length} wines in PDF`);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF");
      setStep("choose");
    } finally {
      setPdfProgress(null);
    }
  };

  const handleCancelPdf = () => {
    pdfCancelledRef.current = true;
  };

  if (step === "choose") {
    return (
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Add Wine</h1>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <label htmlFor="wine-image" className="cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Scan Label
                </CardTitle>
                <CardDescription>
                  Upload a photo of the wine label
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

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <label htmlFor="pdf-file" className="cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Import Wine Card
                </CardTitle>
                <CardDescription>
                  Upload a PDF wine card or menu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  id="pdf-file"
                  ref={pdfFileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
                />
                <Button variant="secondary" className="w-full" asChild>
                  <span>Choose PDF</span>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "pdf" && pdfProgress) {
    return (
      <div className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Import Wine Card</h1>
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <div className="text-center space-y-1">
              <p className="font-medium">Processing wine card...</p>
              <p className="text-muted-foreground">
                Page {pdfProgress.currentPage} of {pdfProgress.totalPages || "?"}
              </p>
              <p className="text-sm text-muted-foreground">
                {pdfProgress.winesFound} wines found so far
              </p>
            </div>
            {pdfProgress.totalPages > 0 && (
              <Progress
                value={(pdfProgress.currentPage / pdfProgress.totalPages) * 100}
                className="w-64"
              />
            )}
            <Button variant="outline" size="sm" onClick={handleCancelPdf}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
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
