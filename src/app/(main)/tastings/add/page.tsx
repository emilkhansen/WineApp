"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StarRating } from "@/components/tastings/star-rating";
import { createTasting } from "@/actions/tastings";
import { createClient } from "@/lib/supabase/client";
import type { Wine } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

export default function AddTastingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedWineId = searchParams.get("wine");

  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingWines, setLoadingWines] = useState(true);

  const [wineId, setWineId] = useState(preselectedWineId || "");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [tastingDate, setTastingDate] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [occasion, setOccasion] = useState("");

  useEffect(() => {
    async function loadWines() {
      const supabase = createClient();
      const { data } = await supabase
        .from("wines")
        .select("*")
        .order("name");

      if (data) {
        setWines(data);
      }
      setLoadingWines(false);
    }

    loadWines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wineId) {
      toast.error("Please select a wine");
      return;
    }

    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setLoading(true);

    const result = await createTasting({
      wine_id: wineId,
      rating,
      notes: notes || undefined,
      tasting_date: format(tastingDate, "yyyy-MM-dd"),
      location: location || undefined,
      occasion: occasion || undefined,
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Tasting recorded successfully");
      router.push("/tastings");
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/tastings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add Tasting</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Wine Selection */}
            <div className="space-y-2">
              <Label htmlFor="wine">Wine *</Label>
              <Select value={wineId} onValueChange={setWineId}>
                <SelectTrigger id="wine">
                  <SelectValue placeholder={loadingWines ? "Loading wines..." : "Select a wine"} />
                </SelectTrigger>
                <SelectContent>
                  {wines.map((wine) => (
                    <SelectItem key={wine.id} value={wine.id}>
                      {wine.name} {wine.vintage && `(${wine.vintage})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {wines.length === 0 && !loadingWines && (
                <p className="text-sm text-muted-foreground">
                  No wines in your collection.{" "}
                  <Link href="/wines/add" className="text-primary hover:underline">
                    Add a wine first
                  </Link>
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating *</Label>
              <StarRating rating={rating} onRatingChange={setRating} size="lg" />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !tastingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tastingDate ? format(tastingDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tastingDate}
                    onSelect={(date) => date && setTastingDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Location & Occasion */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Home, Restaurant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Input
                  id="occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="e.g., Dinner party, Anniversary"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Tasting Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Your impressions, aromas, flavors..."
                rows={4}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !wineId || rating === 0}>
                {loading ? "Saving..." : "Save Tasting"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
