"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
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

  const isEmpty = chartData.length === 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Wine Distribution</CardTitle>
        <div className="flex gap-1">
          <Button
            variant={view === "color" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("color")}
          >
            Color
          </Button>
          <Button
            variant={view === "region" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("region")}
          >
            Region
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No wine data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={55}
              />
              <Tooltip
                formatter={(value) => [`${value} wines`, "Count"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
