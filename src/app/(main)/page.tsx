import Link from "next/link";
import { Plus, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TastingCalendar } from "@/components/dashboard/tasting-calendar";
import { WineDistributionChart } from "@/components/dashboard/wine-distribution-chart";
import { TastingTrendsChart } from "@/components/dashboard/tasting-trends-chart";
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
    <div className="container py-8">
      {/* Dashboard Header + Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Your wine collection at a glance
            </p>
          </div>
          {/* Desktop: buttons next to title */}
          <div className="hidden sm:flex gap-2">
            <Link href="/wines/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Wine
              </Button>
            </Link>
            <Link href="/tastings/add">
              <Button variant="outline">
                <Wine className="mr-2 h-4 w-4" />
                Add Tasting
              </Button>
            </Link>
          </div>
        </div>
        {/* Mobile: buttons below header */}
        <div className="flex gap-2 mt-4 sm:hidden">
          <Link href="/wines/add" className="flex-1">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Wine
            </Button>
          </Link>
          <Link href="/tastings/add" className="flex-1">
            <Button variant="outline" className="w-full">
              <Wine className="mr-2 h-4 w-4" />
              Add Tasting
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="mb-6">
        <StatsCards stats={stats} />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Wine Distribution Chart */}
        <div className="min-w-0">
          <WineDistributionChart data={wineDistribution} />
        </div>

        {/* Tasting Trends */}
        <div className="min-w-0">
          <TastingTrendsChart data={tastingTrends} />
        </div>
      </div>

      {/* Rating Distribution and Top Lists */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Rating Distribution */}
        <div className="min-w-0">
          <RatingDistribution data={ratingDistribution} />
        </div>

        {/* Top Regions/Producers */}
        <div className="min-w-0">
          <TopLists data={topLists} />
        </div>
      </div>

      {/* Activity Feed and Calendar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <ActivityFeed tastings={recentTastings} />
        </div>
        <div className="min-w-0">
          <TastingCalendar initialTastingDates={tastingDates} />
        </div>
      </div>
    </div>
  );
}
