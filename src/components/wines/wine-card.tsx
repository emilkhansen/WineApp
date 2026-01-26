import Link from "next/link";
import { Wine as WineIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Wine } from "@/lib/types";

interface WineCardProps {
  wine: Wine;
}

export function WineCard({ wine }: WineCardProps) {
  return (
    <Link href={`/wines/${wine.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {wine.image_url ? (
              <img
                src={wine.image_url}
                alt={wine.name}
                className="w-16 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                <WineIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{wine.name}</h3>
              {wine.producer && (
                <p className="text-sm text-muted-foreground truncate">
                  {wine.producer}
                </p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {wine.vintage && (
                  <Badge variant="secondary">{wine.vintage}</Badge>
                )}
                {wine.region && (
                  <Badge variant="outline">{wine.region}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full text-sm">
            {wine.grape_variety && (
              <span className="text-muted-foreground truncate">
                {wine.grape_variety}
              </span>
            )}
            <Badge variant={wine.stock > 0 ? "default" : "secondary"}>
              {wine.stock > 0 ? `${wine.stock} in stock` : "Out of stock"}
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
