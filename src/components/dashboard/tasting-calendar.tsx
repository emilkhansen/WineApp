"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { TastingWithWine } from "@/lib/types";
import { DayTastingsModal } from "./day-tastings-modal";

interface TastingCalendarProps {
  initialTastingDates: { [date: string]: number };
}

export function TastingCalendar({ initialTastingDates }: TastingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tastingDates, setTastingDates] = useState(initialTastingDates);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTastings, setSelectedTastings] = useState<TastingWithWine[]>([]);
  const [loadingTastings, setLoadingTastings] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array(startDayOfWeek).fill(null);

  useEffect(() => {
    async function fetchTastingDates() {
      const supabase = createClient();
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const startDate = format(start, "yyyy-MM-dd");
      const endDate = format(end, "yyyy-MM-dd");

      const { data } = await supabase
        .from("tastings")
        .select("tasting_date")
        .gte("tasting_date", startDate)
        .lte("tasting_date", endDate);

      const byDate: { [date: string]: number } = {};
      if (data) {
        for (const tasting of data) {
          const date = tasting.tasting_date;
          byDate[date] = (byDate[date] || 0) + 1;
        }
      }
      setTastingDates(byDate);
    }

    fetchTastingDates();
  }, [currentMonth]);

  const handleDayClick = async (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    if (!tastingDates[dateStr]) return;

    setSelectedDate(day);
    setLoadingTastings(true);

    const supabase = createClient();
    const { data } = await supabase
      .from("tastings")
      .select(`*, wine:wines(*)`)
      .eq("tasting_date", dateStr)
      .order("created_at", { ascending: false });

    setSelectedTastings((data as TastingWithWine[]) || []);
    setLoadingTastings(false);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Calendar</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-32 text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
            {paddingDays.map((_, index) => (
              <div key={`padding-${index}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const hasTastings = tastingDates[dateStr] > 0;
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(day)}
                  disabled={!hasTastings}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center rounded-md text-sm relative",
                    !isSameMonth(day, currentMonth) && "text-muted-foreground/50",
                    isToday && "bg-accent",
                    hasTastings && "hover:bg-muted cursor-pointer",
                    !hasTastings && "cursor-default"
                  )}
                >
                  <span>{format(day, "d")}</span>
                  {hasTastings && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <DayTastingsModal
        date={selectedDate}
        tastings={selectedTastings}
        loading={loadingTastings}
        onClose={() => setSelectedDate(null)}
      />
    </>
  );
}
