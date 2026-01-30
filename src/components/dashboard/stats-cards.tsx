import { Wine, Star, Calendar, Archive, TrendingUp, TrendingDown } from "lucide-react";
import type { EnhancedStats } from "@/lib/types";

interface StatsCardsProps {
  stats: EnhancedStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3 px-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Archive className="h-4 w-4 text-purple-500" />
        <span className="text-lg font-semibold">{stats.cellarSize}</span>
        <span className="text-xs text-muted-foreground">bottles</span>
      </div>

      <div className="flex items-center gap-2">
        <Wine className="h-4 w-4 text-primary" />
        <span className="text-lg font-semibold">{stats.totalWines}</span>
        <span className="text-xs text-muted-foreground">wines</span>
      </div>

      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-yellow-500" />
        <span className="text-lg font-semibold">
          {stats.averageRating !== null ? stats.averageRating : "—"}
        </span>
        <span className="text-xs text-muted-foreground">avg</span>
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-green-500" />
        <span className="text-lg font-semibold">{stats.tastingsThisMonth}</span>
        {stats.tastingsTrend !== 0 && (
          <span
            className={`flex items-center text-xs ${
              stats.tastingsTrend > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {stats.tastingsTrend > 0 ? (
              <TrendingUp className="h-3 w-3 mr-0.5" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-0.5" />
            )}
            {stats.tastingsTrend > 0 ? "+" : ""}
            {stats.tastingsTrend}
          </span>
        )}
        <span className="text-xs text-muted-foreground">this month</span>
      </div>
    </div>
  );
}
