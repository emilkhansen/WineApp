"use client";

import { useState } from "react";
import Image from "next/image";
import { Wine, ChevronDown, ChevronUp, ZoomIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImagePreviewCardProps {
  imageUrl?: string;
  onImageClick?: () => void;
  className?: string;
}

export function ImagePreviewCard({ imageUrl, className }: ImagePreviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Mobile collapsible header */}
      <CardHeader
        className="lg:hidden cursor-pointer py-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Scanned Label</CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Desktop header */}
      <CardHeader className="hidden lg:block py-3">
        <CardTitle className="text-sm font-medium">Scanned Label</CardTitle>
      </CardHeader>

      {/* Image content */}
      <CardContent
        className={cn(
          "p-0 transition-all duration-200",
          !isExpanded && "hidden lg:block"
        )}
      >
        {imageUrl ? (
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative aspect-[3/4] cursor-zoom-in group">
                <Image
                  src={imageUrl}
                  alt="Scanned wine label"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 300px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
              <div className="relative aspect-[3/4] max-h-[85vh]">
                <Image
                  src={imageUrl}
                  alt="Scanned wine label"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="aspect-[3/4] bg-muted flex flex-col items-center justify-center text-muted-foreground">
            <Wine className="h-12 w-12 mb-2" />
            <p className="text-sm">No image available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
