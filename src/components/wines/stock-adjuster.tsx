"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateWineStock } from "@/actions/wines";
import { toast } from "sonner";

interface StockAdjusterProps {
  wineId: string;
  currentStock: number;
}

export function StockAdjuster({ wineId, currentStock }: StockAdjusterProps) {
  const [stock, setStock] = useState(currentStock);
  const [loading, setLoading] = useState(false);

  const handleAdjust = async (delta: number) => {
    const newStock = Math.max(0, stock + delta);
    setLoading(true);

    const result = await updateWineStock(wineId, newStock);

    if (result.error) {
      toast.error(result.error);
    } else {
      setStock(newStock);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleAdjust(-1)}
          disabled={loading || stock === 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-3xl font-bold tabular-nums w-12 text-center">
          {stock}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleAdjust(1)}
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Badge variant={stock > 0 ? "default" : "secondary"}>
        {stock > 0 ? "In Stock" : "Out of Stock"}
      </Badge>
    </div>
  );
}
