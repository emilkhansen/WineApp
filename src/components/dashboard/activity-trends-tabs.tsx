"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Star, ArrowRight, TrendingUp, ChevronRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TastingWithWine, TastingWithWineAndAuthor, TrendData } from "@/lib/types";
import { getWineDisplayName } from "@/lib/wine-utils";

interface ActivityTrendsTabsProps {
  tastings: (TastingWithWine | TastingWithWineAndAuthor)[];
  trendData: TrendData[];
}

function hasAuthor(tasting: TastingWithWine | TastingWithWineAndAuthor): tasting is TastingWithWineAndAuthor {
  return "author" in tasting;
}

const WINE_COLORS: Record<string, string> = {
  red: "#722F37",
  white: "#F5E6C8",
  rosé: "#E8B4B8",
  rose: "#E8B4B8",
  sparkling: "#F7E7CE",
  orange: "#E07830",
  dessert: "#D4A574",
};

function getWineColorHex(color: string | null): string {
  if (!color) return "#9CA3AF";
  return WINE_COLORS[color.toLowerCase()] || "#9CA3AF";
}

export function ActivityTrendsTabs({ tastings, trendData }: ActivityTrendsTabsProps) {
  const [activeTab, setActiveTab] = useState<"activity" | "trends">("activity");
  const isEmpty = trendData.length === 0 || trendData.every((d) => d.count === 0);

  return (
    <Card className="h-[280px] flex flex-col min-w-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant={activeTab === "activity" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("activity")}
            className="h-7 text-xs px-2.5"
          >
            Activity
          </Button>
          <Button
            variant={activeTab === "trends" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("trends")}
            className="h-7 text-xs px-2.5"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Trends
          </Button>
        </div>
        {activeTab === "activity" && (
          <Link href="/tastings">
            <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-0 px-3">
        {activeTab === "activity" ? (
          tastings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tastings recorded yet.
            </p>
          ) : (
            <div className="space-y-1 overflow-y-auto h-full">
              {tastings.map((tasting) => {
                const authorName = hasAuthor(tasting)
                  ? (tasting.author.isMe ? "Me" : (tasting.author.username || "Friend"))
                  : null;
                const wineColor = getWineColorHex(tasting.wine.color);

                return (
                  <Link key={tasting.id} href={`/tastings/${tasting.id}`} className="block">
                    <div className="flex items-center gap-2.5 py-2 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors group">
                      {/* Wine color indicator */}
                      <div
                        className="w-2 h-8 rounded-full shrink-0"
                        style={{ backgroundColor: wineColor }}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">
                            {getWineDisplayName(tasting.wine)}
                          </p>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">{tasting.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground truncate">
                            {[
                              authorName,
                              tasting.wine.region,
                              tasting.wine.vintage,
                            ].filter(Boolean).join(" · ")}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {format(new Date(tasting.tasting_date), "MMM d")}
                          </span>
                        </div>
                      </div>

                      {/* Chevron */}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          isEmpty ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No tasting data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#a1a1aa"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="95%"
                      stopColor="#a1a1aa"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={25}
                />
                <Tooltip
                  formatter={(value) => [`${value} tastings`, "Count"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#a1a1aa"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        )}
      </CardContent>
    </Card>
  );
}
