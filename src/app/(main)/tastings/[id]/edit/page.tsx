"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StarRating } from "@/components/tastings/star-rating";
import { updateTasting } from "@/actions/tastings";
import { createClient } from "@/lib/supabase/client";
import type { TastingWithWine } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";

export default function EditTastingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [tasting, setTasting] = useState<TastingWithWine | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTasting, setLoadingTasting] = useState(true);

  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [tastingDate, setTastingDate] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [occasion, setOccasion] = useState("");

  useEffect(() => {
    async function loadTasting() {
      const supabase = createClient();
      const { data } = await supabase
        .from("tastings")
        .select(`*, wine:wines(*)`)
        .eq("id", id)
        .single();

      if (data) {
        setTasting(data as TastingWithWine);
        setRating(data.rating);
        setNotes(data.notes || "");
        setTastingDate(new Date(data.tasting_date));
        setLocation(data.location || "");
        setOccasion(data.occasion || "");
      }
      setLoadingTasting(false);
    }

    loadTasting();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setLoading(true);

    const result = await updateTasting(id, {
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
      toast.success("Tasting updated successfully");
      router.push(`/tastings/${id}`);
    }
  };

  if (loadingTasting) {
    return (
      <div className="container py-8 max-w-2xl">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!tasting) {
    return (
      <div className="container py-8 max-w-2xl">
        <p className="text-center text-muted-foreground">Tasting not found</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/tastings/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Tasting</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Wine Info (read-only) */}
            <div>
              <Label>Wine</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                {tasting.wine.name} {tasting.wine.vintage && `(${tasting.wine.vintage})`}
              </p>
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
              <Button type="submit" disabled={loading || rating === 0}>
                {loading ? "Saving..." : "Update Tasting"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
