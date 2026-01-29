"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Star, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TastingWithWine } from "@/lib/types";
import { getWineDisplayName } from "@/lib/wine-utils";

interface DayTastingsModalProps {
  date: Date | null;
  tastings: TastingWithWine[];
  loading: boolean;
  onClose: () => void;
}

export function DayTastingsModal({ date, tastings, loading, onClose }: DayTastingsModalProps) {
  return (
    <Dialog open={date !== null} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {date ? format(date, "EEEE, MMMM d, yyyy") : "Tastings"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tastings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No tastings on this day
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tastings.map((tasting) => (
              <Link
                key={tasting.id}
                href={`/tastings/${tasting.id}`}
                onClick={onClose}
              >
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{getWineDisplayName(tasting.wine)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {tasting.rating}/5
                      </span>
                      {tasting.location && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {tasting.location}
                          </span>
                        </>
                      )}
                    </div>
                    {tasting.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {tasting.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
