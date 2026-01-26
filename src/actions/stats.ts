"use server";

import { createClient } from "@/lib/supabase/server";
import { startOfMonth, endOfMonth, format } from "date-fns";

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
