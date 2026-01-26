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
import { WINE_REGIONS } from "@/data/regions";
import { ALL_GRAPE_VARIETIES } from "@/data/grapes";

export interface WineFilters {
  search: string;
  region: string;
  grapeVariety: string;
  stockStatus: "all" | "in-stock" | "out-of-stock";
}

interface WineFiltersProps {
  filters: WineFilters;
  onFiltersChange: (filters: WineFilters) => void;
  resultCount: number;
  totalCount: number;
}

export function WineFiltersComponent({
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}: WineFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filters.region !== "" ||
    filters.grapeVariety !== "" ||
    filters.stockStatus !== "all";

  const activeFilterCount = [
    filters.region !== "",
    filters.grapeVariety !== "",
    filters.stockStatus !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      search: filters.search,
      region: "",
      grapeVariety: "",
      stockStatus: "all",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search wines..."
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
            value={filters.region || "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, region: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {WINE_REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.grapeVariety || "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, grapeVariety: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Grapes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grapes</SelectItem>
              {ALL_GRAPE_VARIETIES.map((grape) => (
                <SelectItem key={grape} value={grape}>
                  {grape}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.stockStatus}
            onValueChange={(value: "all" | "in-stock" | "out-of-stock") =>
              onFiltersChange({ ...filters, stockStatus: value })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
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
          Showing {resultCount} of {totalCount} wines
        </p>
      )}
    </div>
  );
}
