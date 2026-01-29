"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toggleWinePublic } from "@/actions/wines";
import type { Wine } from "@/lib/types";
import { getWineDisplayName } from "@/lib/wine-utils";

interface WineTableProps {
  wines: Wine[];
  showVisibilityToggle?: boolean;
  emptyMessage?: string;
}

export function WineTable({ wines, showVisibilityToggle = false, emptyMessage = "No wines found" }: WineTableProps) {
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const handleToggleVisibility = async (wine: Wine) => {
    setUpdatingIds((prev) => new Set(prev).add(wine.id));
    try {
      await toggleWinePublic(wine.id, !wine.is_public);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(wine.id);
        return next;
      });
    }
  };

  if (wines.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        {emptyMessage}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Wine</TableHead>
          <TableHead className="hidden md:table-cell">Vintage</TableHead>
          <TableHead className="hidden lg:table-cell">Region</TableHead>
          <TableHead className="hidden md:table-cell">Color</TableHead>
          <TableHead>Stock</TableHead>
          {showVisibilityToggle && <TableHead className="w-[50px]">Public</TableHead>}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wines.map((wine) => (
          <TableRow key={wine.id}>
            <TableCell className="font-medium">
              <div>
                <div className="md:max-w-[300px] md:truncate">{getWineDisplayName(wine)}</div>
                {/* Show vintage and color on mobile since those columns are hidden */}
                <div className="md:hidden text-sm text-muted-foreground mt-1">
                  {[wine.vintage, wine.color, wine.region].filter(Boolean).join(" · ")}
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {wine.vintage || "-"}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <div className="max-w-[120px] truncate">
                {wine.region || "-"}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {wine.color ? (
                <Badge variant="secondary">{wine.color}</Badge>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              <Badge variant={wine.stock > 0 ? "default" : "secondary"}>
                {wine.stock}
              </Badge>
            </TableCell>
            {showVisibilityToggle && (
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleVisibility(wine)}
                  disabled={updatingIds.has(wine.id)}
                  title={wine.is_public ? "Make private" : "Make public"}
                >
                  {wine.is_public ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </TableCell>
            )}
            <TableCell className="text-right">
              <Link href={`/wines/${wine.id}`}>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
