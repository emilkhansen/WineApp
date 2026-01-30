"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <>
      <Card className="h-[280px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between py-2 px-3 gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-xs font-medium">
            {format(currentMonth, "MMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 px-2 pb-2 pt-0">
          <div className="grid grid-cols-7 gap-0.5">
            {weekDays.map((day, i) => (
              <div
                key={`${day}-${i}`}
                className="text-center text-[10px] font-medium text-muted-foreground py-1"
              >
                {day}
              </div>
            ))}
            {paddingDays.map((_, index) => (
              <div key={`padding-${index}`} className="w-6 h-6" />
            ))}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const hasTastings = tastingDates[dateStr] > 0;
              const isToday = isSameDay(day, new Date());

              // Calculate heatmap intensity (1-4 scale)
              const count = tastingDates[dateStr] || 0;
              const intensity = Math.min(count, 4);
              const heatmapStyles: Record<number, string> = {
                1: "bg-primary/25",
                2: "bg-primary/50",
                3: "bg-primary/75",
                4: "bg-primary",
              };

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(day)}
                  disabled={!hasTastings}
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded text-xs transition-colors",
                    !isSameMonth(day, currentMonth) && "text-muted-foreground/50",
                    isToday && !hasTastings && "ring-1 ring-primary",
                    hasTastings && heatmapStyles[intensity],
                    hasTastings && intensity >= 3 && "text-primary-foreground",
                    hasTastings && "hover:opacity-80 cursor-pointer",
                    !hasTastings && "cursor-default"
                  )}
                  title={hasTastings ? `${count} tasting${count > 1 ? "s" : ""}` : undefined}
                >
                  <span className="text-[10px]">{format(day, "d")}</span>
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
