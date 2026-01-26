"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Wine as WineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WineCard } from "@/components/wines/wine-card";
import { WineFiltersComponent, type WineFilters } from "@/components/wines/wine-filters";
import type { Wine } from "@/lib/types";

interface WineListProps {
  wines: Wine[];
}

export function WineList({ wines }: WineListProps) {
  const [filters, setFilters] = useState<WineFilters>({
    search: "",
    region: "",
    grapeVariety: "",
    stockStatus: "all",
  });

  const filteredWines = useMemo(() => {
    return wines.filter((wine) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          wine.name.toLowerCase().includes(searchLower) ||
          wine.producer?.toLowerCase().includes(searchLower) ||
          wine.region?.toLowerCase().includes(searchLower) ||
          wine.grape_variety?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Region filter
      if (filters.region && wine.region !== filters.region) {
        return false;
      }

      // Grape variety filter
      if (filters.grapeVariety && wine.grape_variety !== filters.grapeVariety) {
        return false;
      }

      // Stock status filter
      if (filters.stockStatus === "in-stock" && wine.stock === 0) {
        return false;
      }
      if (filters.stockStatus === "out-of-stock" && wine.stock > 0) {
        return false;
      }

      return true;
    });
  }, [wines, filters]);

  if (wines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <WineIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No wines yet</h2>
        <p className="text-muted-foreground mb-4">
          Start building your collection by adding your first wine.
        </p>
        <Link href="/wines/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Wine
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WineFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredWines.length}
        totalCount={wines.length}
      />

      {filteredWines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <WineIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">No matching wines</h2>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWines.map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </div>
      )}
    </div>
  );
}
