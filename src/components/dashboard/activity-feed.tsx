import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Star, ArrowRight, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TastingWithWine, TastingWithWineAndAuthor } from "@/lib/types";
import { getWineDisplayName } from "@/lib/wine-utils";

interface ActivityFeedProps {
  tastings: (TastingWithWine | TastingWithWineAndAuthor)[];
}

function hasAuthor(tasting: TastingWithWine | TastingWithWineAndAuthor): tasting is TastingWithWineAndAuthor {
  return "author" in tasting;
}

export function ActivityFeed({ tastings }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
        <CardTitle className="text-lg shrink-0">Recent Tastings</CardTitle>
        <Link href="/tastings">
          <Button variant="ghost" size="sm" className="shrink-0">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {tastings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Image
              src="/swrlingwine-nobg.png"
              alt="Wine glass"
              width={80}
              height={80}
              className="mb-3 opacity-80"
            />
            <p className="text-sm text-muted-foreground">
              Your wine journey starts here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tastings.map((tasting) => {
              const authorName = hasAuthor(tasting)
                ? (tasting.author.isMe ? "Me" : (tasting.author.username || "Friend"))
                : null;

              return (
                <Link key={tasting.id} href={`/tastings/${tasting.id}`}>
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{getWineDisplayName(tasting.wine)}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        {authorName && (
                          <>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {authorName}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {tasting.rating}
                        </span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(tasting.created_at), { addSuffix: true })}</span>
                        {tasting.location && (
                          <>
                            <span>•</span>
                            <span className="truncate">{tasting.location}</span>
                          </>
                        )}
                      </div>
                      {tasting.notes && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {tasting.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
