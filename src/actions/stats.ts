"use server";

import { createClient } from "@/lib/supabase/server";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import type {
  EnhancedStats,
  DistributionData,
  TrendData,
  RatingDistribution,
  TopListsData,
} from "@/lib/types";

export interface DashboardStats {
  totalWines: number;
  averageRating: number | null;
  tastingsThisMonth: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { totalWines: 0, averageRating: null, tastingsThisMonth: 0 };
  }

  // Get total wines count
  const { count: totalWines } = await supabase
    .from("wines")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get average rating
  const { data: ratingData } = await supabase
    .from("tastings")
    .select("rating")
    .eq("user_id", user.id);

  let averageRating: number | null = null;
  if (ratingData && ratingData.length > 0) {
    const sum = ratingData.reduce((acc, t) => acc + t.rating, 0);
    averageRating = Math.round((sum / ratingData.length) * 10) / 10;
  }

  // Get tastings this month
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

  const { count: tastingsThisMonth } = await supabase
    .from("tastings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("tasting_date", monthStart)
    .lte("tasting_date", monthEnd);

  return {
    totalWines: totalWines || 0,
    averageRating,
    tastingsThisMonth: tastingsThisMonth || 0,
  };
}

export interface TastingsByDate {
  [date: string]: number;
}

export async function getTastingDatesForMonth(year: number, month: number): Promise<TastingsByDate> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {};
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const { data } = await supabase
    .from("tastings")
    .select("tasting_date")
    .eq("user_id", user.id)
    .gte("tasting_date", format(startDate, "yyyy-MM-dd"))
    .lte("tasting_date", format(endDate, "yyyy-MM-dd"));

  const byDate: TastingsByDate = {};
  if (data) {
    for (const tasting of data) {
      const date = tasting.tasting_date;
      byDate[date] = (byDate[date] || 0) + 1;
    }
  }

  return byDate;
}

const WINE_COLORS: Record<string, string> = {
  Red: "#722F37",
  White: "#F5E6D3",
  Rosé: "#FFB6C1",
  Orange: "#E8A87C",
  Sparkling: "#FFD700",
  Dessert: "#DAA520",
};

export async function getEnhancedStats(): Promise<EnhancedStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      cellarSize: 0,
      totalWines: 0,
      uniqueProducers: 0,
      averageRating: null,
      tastingsThisMonth: 0,
      tastingsTrend: 0,
    };
  }

  // Get wines with stock for cellar size and producer for unique count
  const { data: winesData } = await supabase
    .from("wines")
    .select("stock, producer")
    .eq("user_id", user.id);

  const cellarSize = winesData?.reduce((acc, w) => acc + (w.stock > 0 ? w.stock : 0), 0) || 0;
  const totalWines = winesData?.length || 0;
  const uniqueProducers = new Set(winesData?.map((w) => w.producer).filter(Boolean)).size;

  // Get average rating
  const { data: ratingData } = await supabase
    .from("tastings")
    .select("rating")
    .eq("user_id", user.id);

  let averageRating: number | null = null;
  if (ratingData && ratingData.length > 0) {
    const sum = ratingData.reduce((acc, t) => acc + t.rating, 0);
    averageRating = Math.round((sum / ratingData.length) * 10) / 10;
  }

  // Get tastings this month
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

  const { count: tastingsThisMonth } = await supabase
    .from("tastings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("tasting_date", monthStart)
    .lte("tasting_date", monthEnd);

  // Get tastings last month for trend
  const lastMonth = subMonths(now, 1);
  const lastMonthStart = format(startOfMonth(lastMonth), "yyyy-MM-dd");
  const lastMonthEnd = format(endOfMonth(lastMonth), "yyyy-MM-dd");

  const { count: tastingsLastMonth } = await supabase
    .from("tastings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("tasting_date", lastMonthStart)
    .lte("tasting_date", lastMonthEnd);

  const tastingsTrend = (tastingsThisMonth || 0) - (tastingsLastMonth || 0);

  return {
    cellarSize,
    totalWines,
    uniqueProducers,
    averageRating,
    tastingsThisMonth: tastingsThisMonth || 0,
    tastingsTrend,
  };
}

export async function getWineDistribution(): Promise<DistributionData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { byColor: [], byRegion: [] };
  }

  const { data: wines } = await supabase
    .from("wines")
    .select("color, region")
    .eq("user_id", user.id);

  if (!wines) {
    return { byColor: [], byRegion: [] };
  }

  // Group by color
  const colorCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {};

  for (const wine of wines) {
    if (wine.color) {
      colorCounts[wine.color] = (colorCounts[wine.color] || 0) + 1;
    }
    if (wine.region) {
      regionCounts[wine.region] = (regionCounts[wine.region] || 0) + 1;
    }
  }

  const byColor = Object.entries(colorCounts)
    .map(([name, count]) => ({
      name,
      count,
      fill: WINE_COLORS[name] || "#888888",
    }))
    .sort((a, b) => b.count - a.count);

  const byRegion = Object.entries(regionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return { byColor, byRegion };
}

export async function getTastingTrends(): Promise<TrendData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const now = new Date();
  const sixMonthsAgo = subMonths(now, 5);
  const startDate = format(startOfMonth(sixMonthsAgo), "yyyy-MM-dd");

  const { data: tastings } = await supabase
    .from("tastings")
    .select("tasting_date")
    .eq("user_id", user.id)
    .gte("tasting_date", startDate);

  if (!tastings) {
    return [];
  }

  // Group by month
  const monthCounts: Record<string, number> = {};

  // Initialize all 6 months with 0
  for (let i = 5; i >= 0; i--) {
    const month = subMonths(now, i);
    const key = format(month, "MMM");
    monthCounts[key] = 0;
  }

  // Count tastings per month
  for (const tasting of tastings) {
    const date = new Date(tasting.tasting_date);
    const key = format(date, "MMM");
    if (key in monthCounts) {
      monthCounts[key]++;
    }
  }

  // Convert to array in order
  const result: TrendData[] = [];
  for (let i = 5; i >= 0; i--) {
    const month = subMonths(now, i);
    const key = format(month, "MMM");
    result.push({ month: key, count: monthCounts[key] });
  }

  return result;
}

export async function getRatingDistribution(): Promise<RatingDistribution[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: tastings } = await supabase
    .from("tastings")
    .select("rating")
    .eq("user_id", user.id);

  if (!tastings || tastings.length === 0) {
    return [];
  }

  // Count ratings
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const tasting of tastings) {
    const rating = Math.round(tasting.rating);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating]++;
    }
  }

  const total = tastings.length;

  return [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: ratingCounts[rating],
    percentage: Math.round((ratingCounts[rating] / total) * 100),
  }));
}

export async function getTopLists(): Promise<TopListsData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { regions: [], producers: [] };
  }

  const { data: wines } = await supabase
    .from("wines")
    .select("region, producer")
    .eq("user_id", user.id);

  if (!wines) {
    return { regions: [], producers: [] };
  }

  const regionCounts: Record<string, number> = {};
  const producerCounts: Record<string, number> = {};

  for (const wine of wines) {
    if (wine.region) {
      regionCounts[wine.region] = (regionCounts[wine.region] || 0) + 1;
    }
    if (wine.producer) {
      producerCounts[wine.producer] = (producerCounts[wine.producer] || 0) + 1;
    }
  }

  const regions = Object.entries(regionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const producers = Object.entries(producerCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { regions, producers };
}
