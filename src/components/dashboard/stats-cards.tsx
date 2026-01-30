import { Wine, Star, Calendar, Archive, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { EnhancedStats } from "@/lib/types";

interface StatsCardsProps {
  stats: EnhancedStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
              <Archive className="h-5 w-5 text-purple-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Bottles in Cellar</p>
              <p className="text-xl font-bold">{stats.cellarSize}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Wine className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Unique Wines</p>
              <p className="text-xl font-bold">{stats.totalWines}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Average Rating</p>
              <p className="text-xl font-bold">
                {stats.averageRating !== null ? `${stats.averageRating}/5` : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Tastings This Month</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{stats.tastingsThisMonth}</p>
                {stats.tastingsTrend !== 0 && (
                  <span
                    className={`flex items-center text-xs ${
                      stats.tastingsTrend > 0
                        ? "text-green-500"
                        : "text-red-500"
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
