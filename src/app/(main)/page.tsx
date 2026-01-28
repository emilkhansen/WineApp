import Link from "next/link";
import { Plus, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TastingCalendar } from "@/components/dashboard/tasting-calendar";
import { getDashboardStats, getTastingDatesForMonth } from "@/actions/stats";
import { getTastingsWithFriends } from "@/actions/tastings";

export default async function DashboardPage() {
  const [stats, tastings, tastingDates] = await Promise.all([
    getDashboardStats(),
    getTastingsWithFriends(),
    getTastingDatesForMonth(new Date().getFullYear(), new Date().getMonth()),
  ]);

  // Get recent tastings (limit to 5)
  const recentTastings = tastings.slice(0, 5);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your wine collection at a glance
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Stats Cards */}
      <div className="mb-8">
        <StatsCards stats={stats} />
      </div>

      {/* Activity Feed and Calendar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed tastings={recentTastings} />
        <TastingCalendar initialTastingDates={tastingDates} />
      </div>
    </div>
  );
}
