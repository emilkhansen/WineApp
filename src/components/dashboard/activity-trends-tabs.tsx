"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Star, ArrowRight, User, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function ActivityTrendsTabs({ tastings, trendData }: ActivityTrendsTabsProps) {
  const [activeTab, setActiveTab] = useState<"activity" | "trends">("activity");
  const isEmpty = trendData.length === 0 || trendData.every((d) => d.count === 0);

  return (
    <Card className="h-[280px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "activity" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("activity")}
            className="h-7 text-xs"
          >
            Activity
          </Button>
          <Button
            variant={activeTab === "trends" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("trends")}
            className="h-7 text-xs"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Trends
          </Button>
        </div>
        {activeTab === "activity" && (
          <Link href="/tastings">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-0">
        {activeTab === "activity" ? (
          tastings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tastings recorded yet.
            </p>
          ) : (
            <div className="space-y-1 overflow-y-auto h-full pr-1">
              {tastings.map((tasting) => {
                const authorName = hasAuthor(tasting)
                  ? (tasting.author.isMe ? "Me" : (tasting.author.username || "Friend"))
                  : null;

                return (
                  <Link key={tasting.id} href={`/tastings/${tasting.id}`}>
                    <div className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getWineDisplayName(tasting.wine)}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {authorName && (
                            <>
                              <span className="flex items-center gap-0.5">
                                <User className="h-2.5 w-2.5" />
                                {authorName}
                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span className="flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                            {tasting.rating}
                          </span>
                          <span>•</span>
                          <span>{format(new Date(tasting.tasting_date), "MMM d")}</span>
                        </div>
                      </div>
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
                      stopColor="hsl(var(--muted-foreground))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--muted-foreground))"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
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
                  stroke="hsl(var(--muted-foreground))"
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
