"use client";

import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
          <Select
            value={filters.color || "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, color: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Colors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              {WINE_COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.vintage || "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, vintage: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Vintages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vintages</SelectItem>
              {availableVintages.map((vintage) => (
                <SelectItem key={vintage} value={String(vintage)}>
                  {vintage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.producer || "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, producer: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Producers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Producers</SelectItem>
              {availableProducers.map((producer) => (
                <SelectItem key={producer} value={producer}>
                  {producer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.vineyard || "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, vineyard: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Vineyards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vineyards</SelectItem>
              {availableVineyards.map((vineyard) => (
                <SelectItem key={vineyard} value={vineyard}>
                  {vineyard}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
