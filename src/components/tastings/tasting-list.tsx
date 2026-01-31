"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Wine as WineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TastingListItem } from "@/components/tastings/tasting-list-item";
import { TastingFiltersComponent, type TastingFilters } from "@/components/tastings/tasting-filters";
import type { TastingWithWineAndAuthor } from "@/lib/types";
import { getWineDisplayName } from "@/lib/wine-utils";

interface TastingListProps {
  tastings: TastingWithWineAndAuthor[];
}

export function TastingList({ tastings }: TastingListProps) {
  const [filters, setFilters] = useState<TastingFilters>({
    search: "",
    color: "",
    vintage: "",
    producer: "",
    vineyard: "",
  });

  // Extract unique values for filter dropdowns
  const { availableVintages, availableProducers, availableVineyards } = useMemo(() => {
    const vintages = new Set<number>();
    const producers = new Set<string>();
    const vineyards = new Set<string>();

    tastings.forEach((tasting) => {
      if (tasting.wine.vintage) {
        vintages.add(tasting.wine.vintage);
      }
      if (tasting.wine.producer) {
        producers.add(tasting.wine.producer);
      }
      if (tasting.wine.vineyard) {
        vineyards.add(tasting.wine.vineyard);
      }
    });

    return {
      availableVintages: Array.from(vintages).sort((a, b) => b - a), // Descending
      availableProducers: Array.from(producers).sort((a, b) => a.localeCompare(b)),
      availableVineyards: Array.from(vineyards).sort((a, b) => a.localeCompare(b)),
    };
  }, [tastings]);

  const filteredTastings = useMemo(() => {
    return tastings.filter((tasting) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const displayName = getWineDisplayName(tasting.wine).toLowerCase();
        const matchesSearch =
          displayName.includes(searchLower) ||
          tasting.notes?.toLowerCase().includes(searchLower) ||
          tasting.location?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Color filter
      if (filters.color && tasting.wine.color !== filters.color) {
        return false;
      }

      // Vintage filter
      if (filters.vintage && String(tasting.wine.vintage) !== filters.vintage) {
        return false;
      }

      // Producer filter
      if (filters.producer && tasting.wine.producer !== filters.producer) {
        return false;
      }

      // Vineyard filter
      if (filters.vineyard && tasting.wine.vineyard !== filters.vineyard) {
        return false;
      }

      return true;
    });
  }, [tastings, filters]);

  if (tastings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Image
          src="/swrlingwine-nobg.png"
          alt="Wine glass"
          width={120}
          height={120}
          className="mb-4 opacity-80"
        />
        <h2 className="text-xl font-semibold mb-2">Your wine journal awaits</h2>
        <p className="text-muted-foreground mb-4">
          Capture tasting notes, track your favorites, and build your collection.
        </p>
        <Link href="/tastings/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Your First Tasting
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TastingFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredTastings.length}
        totalCount={tastings.length}
        availableVintages={availableVintages}
        availableProducers={availableProducers}
        availableVineyards={availableVineyards}
      />

      {filteredTastings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <WineIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">No matching tastings</h2>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTastings.map((tasting) => (
            <TastingListItem key={tasting.id} tasting={tasting} />
          ))}
        </div>
      )}
    </div>
  );
}
