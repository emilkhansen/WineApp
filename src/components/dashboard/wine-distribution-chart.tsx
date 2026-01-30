"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DistributionData } from "@/lib/types";

const REGION_COLORS = [
  "#722F37",
  "#8B4513",
  "#556B2F",
  "#4A5568",
  "#6B46C1",
  "#2D3748",
  "#9C4221",
  "#1E3A5F",
  "#4A1942",
  "#2C5530",
];

interface WineDistributionChartProps {
  data: DistributionData;
}

export function WineDistributionChart({ data }: WineDistributionChartProps) {
  const [view, setView] = useState<"color" | "region">("color");

  const chartData =
    view === "color"
      ? data.byColor
      : data.byRegion.map((item, i) => ({
          ...item,
          fill: REGION_COLORS[i % REGION_COLORS.length],
        }));

  // Show top 10 items
  const displayData = chartData.slice(0, 10);
  const isEmpty = displayData.length === 0;
  const maxCount = Math.max(...displayData.map(d => d.count), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Distribution</CardTitle>
        <div className="flex gap-0.5">
          <Button
            variant={view === "color" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("color")}
            className="h-6 text-[10px] px-2"
          >
            Color
          </Button>
          <Button
            variant={view === "region" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("region")}
            className="h-6 text-[10px] px-2"
          >
            Region
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="py-8 flex items-center justify-center text-muted-foreground text-xs">
            No wine data yet
          </div>
        ) : (
          <div className="space-y-1.5">
            {displayData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="text-xs w-16 truncate">{item.name}</span>
                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${(item.count / maxCount) * 100}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
