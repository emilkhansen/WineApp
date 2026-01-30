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

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top Collections</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No data yet
          </div>
        ) : (
          <div className="space-y-4">
            {hasRegions && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Top Regions
                </h4>
                <ul className="space-y-1.5">
                  {data.regions.map((region, index) => (
                    <li
                      key={region.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate flex-1">
                        <span className="text-muted-foreground mr-2">
                          {index + 1}.
                        </span>
                        {region.name}
                      </span>
                      <Badge variant="secondary" className="ml-2">
                        {region.count}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasProducers && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Top Producers
                </h4>
                <ul className="space-y-1.5">
                  {data.producers.map((producer, index) => (
                    <li
                      key={producer.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate flex-1">
                        <span className="text-muted-foreground mr-2">
                          {index + 1}.
                        </span>
                        {producer.name}
                      </span>
                      <Badge variant="secondary" className="ml-2">
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
