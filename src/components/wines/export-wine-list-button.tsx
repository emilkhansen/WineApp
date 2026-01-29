"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateWineListPdf } from "@/lib/pdf/wine-list-generator";
import type { Wine } from "@/lib/types";

interface ExportWineListButtonProps {
  wines: Wine[];
}

export function ExportWineListButton({ wines }: ExportWineListButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      // Small delay to allow UI to update
      await new Promise((resolve) => setTimeout(resolve, 50));
      generateWineListPdf(wines);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={wines.length === 0 || isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      Export PDF
    </Button>
  );
}
