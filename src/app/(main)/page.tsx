import Link from "next/link";
import { Plus, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityTrendsTabs } from "@/components/dashboard/activity-trends-tabs";
import { TastingCalendar } from "@/components/dashboard/tasting-calendar";
import { WineDistributionChart } from "@/components/dashboard/wine-distribution-chart";
import { RatingDistribution } from "@/components/dashboard/rating-distribution";
import { TopLists } from "@/components/dashboard/top-lists";
import {
  getEnhancedStats,
  getTastingDatesForMonth,
  getWineDistribution,
  getTastingTrends,
  getRatingDistribution,
  getTopLists,
} from "@/actions/stats";
import { getTastingsWithFriends } from "@/actions/tastings";

export default async function DashboardPage() {
  const [
    stats,
    tastings,
    tastingDates,
    wineDistribution,
    tastingTrends,
    ratingDistribution,
    topLists,
  ] = await Promise.all([
    getEnhancedStats(),
    getTastingsWithFriends(),
    getTastingDatesForMonth(new Date().getFullYear(), new Date().getMonth()),
    getWineDistribution(),
    getTastingTrends(),
    getRatingDistribution(),
    getTopLists(),
  ]);

  // Get recent tastings (limit to 5)
  const recentTastings = tastings.slice(0, 5);

  return (
    <div className="container py-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/wines/add">
            <Button size="sm" className="h-8">
              <Plus className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Add </span>Wine
            </Button>
          </Link>
          <Link href="/tastings/add">
            <Button variant="outline" size="sm" className="h-8">
              <Wine className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Add </span>Tasting
            </Button>
          </Link>
        </div>
      </div>

      {/* Inline Stats Bar */}
      <div className="mb-4">
        <StatsCards stats={stats} />
      </div>

      {/* Activity/Trends + Calendar Row */}
      <div className="grid gap-4 lg:grid-cols-[1fr_200px] mb-4">
        <ActivityTrendsTabs tastings={recentTastings} trendData={tastingTrends} />
        <div className="hidden lg:block">
          <TastingCalendar initialTastingDates={tastingDates} />
        </div>
      </div>

      {/* Mobile Calendar (visible only on mobile) */}
      <div className="lg:hidden mb-4">
        <TastingCalendar initialTastingDates={tastingDates} />
      </div>

      {/* Three-Column Bottom Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <WineDistributionChart data={wineDistribution} />
        <TopLists data={topLists} />
        <RatingDistribution data={ratingDistribution} />
      </div>
    </div>
  );
}
