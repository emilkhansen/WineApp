import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TopListsData } from "@/lib/types";

interface TopListsProps {
  data: TopListsData;
}

export function TopLists({ data }: TopListsProps) {
  const hasRegions = data.regions.length > 0;
  const hasProducers = data.producers.length > 0;
  const isEmpty = !hasRegions && !hasProducers;

  // Show top 10 items each
  const topRegions = data.regions.slice(0, 10);
  const topProducers = data.producers.slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Top Collections</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="py-8 flex items-center justify-center text-muted-foreground text-xs">
            No data yet
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {hasRegions && (
              <div>
                <h4 className="text-[10px] font-medium text-muted-foreground mb-2">
                  Regions
                </h4>
                <ul className="space-y-1">
                  {topRegions.map((region, index) => (
                    <li
                      key={region.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="truncate flex-1">
                        <span className="text-muted-foreground mr-1">
                          {index + 1}.
                        </span>
                        {region.name}
                      </span>
                      <Badge variant="secondary" className="ml-1 h-5 text-[10px] px-1.5">
                        {region.count}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasProducers && (
              <div>
                <h4 className="text-[10px] font-medium text-muted-foreground mb-2">
                  Producers
                </h4>
                <ul className="space-y-1">
                  {topProducers.map((producer, index) => (
                    <li
                      key={producer.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="truncate flex-1">
                        <span className="text-muted-foreground mr-1">
                          {index + 1}.
                        </span>
                        {producer.name}
                      </span>
                      <Badge variant="secondary" className="ml-1 h-5 text-[10px] px-1.5">
                        {producer.count}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
