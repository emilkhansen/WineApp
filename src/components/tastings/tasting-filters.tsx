"use client";

import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { WINE_COLORS } from "@/data/colors";

export interface TastingFilters {
  search: string;
  color: string;
  vintage: string;
  producer: string;
  vineyard: string;
}

interface TastingFiltersProps {
  filters: TastingFilters;
  onFiltersChange: (filters: TastingFilters) => void;
  resultCount: number;
  totalCount: number;
  availableVintages: number[];
  availableProducers: string[];
  availableVineyards: string[];
}

export function TastingFiltersComponent({
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
  availableVintages,
  availableProducers,
  availableVineyards,
}: TastingFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filters.color !== "" ||
    filters.vintage !== "" ||
    filters.producer !== "" ||
    filters.vineyard !== "";

  const activeFilterCount = [
    filters.color !== "",
    filters.vintage !== "",
    filters.producer !== "",
    filters.vineyard !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      search: filters.search,
      color: "",
      vintage: "",
      producer: "",
      vineyard: "",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tastings..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="default"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg">
          <Combobox
            options={[
              { value: "", label: "All Colors" },
              ...WINE_COLORS.map((color) => ({ value: color, label: color })),
            ]}
            value={filters.color}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, color: value })
            }
            placeholder="All Colors"
            searchPlaceholder="Search colors..."
            className="w-36"
          />

          <Combobox
            options={[
              { value: "", label: "All Vintages" },
              ...availableVintages.map((vintage) => ({
                value: String(vintage),
                label: String(vintage),
              })),
            ]}
            value={filters.vintage}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, vintage: value })
            }
            placeholder="All Vintages"
            searchPlaceholder="Search vintages..."
            className="w-36"
          />

          <Combobox
            options={[
              { value: "", label: "All Producers" },
              ...availableProducers.map((producer) => ({
                value: producer,
                label: producer,
              })),
            ]}
            value={filters.producer}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, producer: value })
            }
            placeholder="All Producers"
            searchPlaceholder="Search producers..."
            className="w-48"
          />

          <Combobox
            options={[
              { value: "", label: "All Vineyards" },
              ...availableVineyards.map((vineyard) => ({
                value: vineyard,
                label: vineyard,
              })),
            ]}
            value={filters.vineyard}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, vineyard: value })
            }
            placeholder="All Vineyards"
            searchPlaceholder="Search vineyards..."
            className="w-48"
          />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Result Count */}
      {(filters.search || hasActiveFilters) && (
        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} tastings
        </p>
      )}
    </div>
  );
}
