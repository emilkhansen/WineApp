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
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Ratings</CardTitle>
        <p className="text-[10px] text-muted-foreground">
          {total > 0 ? `${total} tastings` : "No tastings yet"}
        </p>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="py-8 flex items-center justify-center text-muted-foreground text-xs">
            No rating data yet
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-1.5">
              {data.map((item, index) => (
                <Tooltip key={item.rating}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 cursor-pointer">
                      <span className="text-xs w-5">{item.rating}★</span>
                      <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                        <div
                          className="h-full rounded transition-all hover:opacity-80"
                          style={{
                            width: `${(item.count / maxCount) * 100}%`,
                            backgroundColor: RATING_COLORS[index],
                          }}
                        />
                      </div>
                      <span className="text-xs w-6 text-right">{item.count}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {item.rating} star{item.rating !== 1 ? "s" : ""}:{" "}
                      {item.count} ({item.percentage}%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
