import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Star, MapPin, Calendar, User, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Tasting, TastingWithWine, TastingWithWineAndAuthor } from "@/lib/types";
import { getWineDisplayName } from "@/lib/wine-utils";

interface TastingListItemProps {
  tasting: Tasting | TastingWithWine | TastingWithWineAndAuthor;
  showWine?: boolean;
}

function isWithWine(tasting: Tasting | TastingWithWine | TastingWithWineAndAuthor): tasting is TastingWithWine {
  return "wine" in tasting && tasting.wine !== null;
}

function hasAuthor(tasting: Tasting | TastingWithWine | TastingWithWineAndAuthor): tasting is TastingWithWineAndAuthor {
  return "author" in tasting;
}

function hasFriends(tasting: Tasting | TastingWithWine | TastingWithWineAndAuthor): tasting is TastingWithWine {
  return "friends" in tasting && Array.isArray((tasting as TastingWithWine).friends);
}

const WINE_COLORS: Record<string, string> = {
  red: "#722F37",
  white: "#F5E6C8",
  rosé: "#E8B4B8",
  rose: "#E8B4B8",
  sparkling: "#F7E7CE",
  orange: "#E07830",
  dessert: "#D4A574",
};

function getWineColorHex(color: string | null): string {
  if (!color) return "#9CA3AF";
  return WINE_COLORS[color.toLowerCase()] || "#9CA3AF";
}

export function TastingListItem({ tasting, showWine = true }: TastingListItemProps) {
  const authorName = hasAuthor(tasting)
    ? (tasting.author.isMe ? "Me" : (tasting.author.username || "Friend"))
    : null;

  const wine = isWithWine(tasting) ? tasting.wine : null;
  const wineColor = wine ? getWineColorHex(wine.color) : "#9CA3AF";
  const friends = hasFriends(tasting) ? tasting.friends || [] : [];

  return (
    <Link href={`/tastings/${tasting.id}`} className="block">
      <Card className="overflow-hidden hover:bg-muted/30 transition-colors group">
        <div className="flex">
          {/* Wine color indicator */}
          <div
            className="w-2 shrink-0"
            style={{ backgroundColor: wineColor }}
          />

          {/* Content */}
          <div className="flex-1 min-w-0 p-4">
            {/* Top row: Wine name and rating */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {showWine && wine && (
                  <h3 className="font-semibold text-base truncate">
                    {getWineDisplayName(wine)}
                  </h3>
                )}
                {/* Wine details */}
                {wine && (
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {[
                      wine.region,
                      wine.vintage,
                      wine.grape,
                    ].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              {/* Rating badge */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-full px-2.5 py-1 shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{tasting.rating}</span>
              </div>
            </div>

            {/* Notes preview */}
            {tasting.notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {tasting.notes}
              </p>
            )}

            {/* Bottom row: Metadata */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
              {(authorName || friends.length > 0) && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>
                    {(() => {
                      const iAmParticipant = friends.some(f => f.isMe);
                      const otherFriends = friends.filter(f => !f.isMe).map(f => f.profile.username || f.profile.email);

                      if (iAmParticipant) {
                        // I'm a participant, show "Me and [author] and [others]"
                        const others = [authorName, ...otherFriends].filter(Boolean);
                        return others.length > 0 ? `Me and ${others.join(", ")}` : "Me";
                      } else {
                        // I'm the author or just viewing
                        const others = otherFriends;
                        return others.length > 0 ? `${authorName || "Me"} and ${others.join(", ")}` : (authorName || "Me");
                      }
                    })()}
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(tasting.created_at), { addSuffix: true })}
              </span>
              {tasting.location && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{tasting.location}</span>
                </span>
              )}
            </div>
          </div>

          {/* Chevron */}
          <div className="flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
