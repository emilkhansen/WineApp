import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TastingDetailLoading() {
  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-9 flex-1 max-w-[120px]" />
        <Skeleton className="h-10 w-20" />
      </div>

      <div className="space-y-6">
        {/* Wine Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-start">
              <Skeleton className="w-16 h-20 rounded" />
              <div className="flex-1">
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasting Details */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-6" />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-28" />
            </div>

            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-5 w-40" />
            </div>

            <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
