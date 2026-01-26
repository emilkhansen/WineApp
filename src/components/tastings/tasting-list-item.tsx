import Link from "next/link";
import { format } from "date-fns";
import { Star, MapPin, Calendar } from "lucide-react";
import type { Tasting, TastingWithWine } from "@/lib/types";

interface TastingListItemProps {
  tasting: Tasting | TastingWithWine;
  showWine?: boolean;
}

function isWithWine(tasting: Tasting | TastingWithWine): tasting is TastingWithWine {
  return "wine" in tasting && tasting.wine !== null;
}

export function TastingListItem({ tasting, showWine = true }: TastingListItemProps) {
  return (
    <Link href={`/tastings/${tasting.id}`}>
      <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex-1 min-w-0">
          {showWine && isWithWine(tasting) && (
            <p className="font-medium truncate">{tasting.wine.name}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {tasting.rating}/5
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(tasting.tasting_date), "MMM d, yyyy")}
            </span>
            {tasting.location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3" />
                {tasting.location}
              </span>
            )}
          </div>
          {tasting.notes && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {tasting.notes}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
