"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RatingDistribution as RatingDistributionType } from "@/lib/types";

const RATING_COLORS = [
  "#EF4444", // 1 star - red
  "#F97316", // 2 stars - orange
  "#EAB308", // 3 stars - yellow
  "#84CC16", // 4 stars - lime
  "#22C55E", // 5 stars - green
];

interface RatingDistributionProps {
  data: RatingDistributionType[];
}

export function RatingDistribution({ data }: RatingDistributionProps) {
  const isEmpty = data.length === 0 || data.every((d) => d.count === 0);
  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Rating Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          {total > 0 ? `${total} tastings` : "No tastings yet"}
        </p>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="h-[80px] flex items-center justify-center text-muted-foreground">
            No rating data yet
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-3">
              {/* Stacked horizontal bar */}
              <div className="h-8 w-full rounded-full overflow-hidden flex">
                {data.map((item, index) => (
                  <Tooltip key={item.rating}>
                    <TooltipTrigger asChild>
                      <div
                        className="h-full transition-all hover:opacity-80 cursor-pointer"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: RATING_COLORS[index],
                          minWidth: item.count > 0 ? "8px" : "0",
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {item.rating} star{item.rating !== 1 ? "s" : ""}:{" "}
                        {item.count} ({item.percentage}%)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-between text-xs text-muted-foreground">
                {data.map((item, index) => (
                  <div key={item.rating} className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: RATING_COLORS[index] }}
                    />
                    <span>{item.rating}★</span>
                  </div>
                ))}
              </div>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
