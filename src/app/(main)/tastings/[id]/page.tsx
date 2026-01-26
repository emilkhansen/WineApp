import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Edit, MapPin, Calendar, Wine as WineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTasting } from "@/actions/tastings";
import { StarRating } from "@/components/tastings/star-rating";
import { DeleteTastingButton } from "@/components/tastings/delete-tasting-button";

interface TastingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TastingDetailPage({ params }: TastingDetailPageProps) {
  const { id } = await params;
  const tasting = await getTasting(id);

  if (!tasting) {
    notFound();
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/tastings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex-1">Tasting</h1>
        <Link href={`/tastings/${tasting.id}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Wine Info */}
        <Card>
          <CardContent className="pt-6">
            <Link href={`/wines/${tasting.wine.id}`} className="block hover:opacity-80">
              <div className="flex gap-4 items-start">
                {tasting.wine.image_url ? (
                  <img
                    src={tasting.wine.image_url}
                    alt={tasting.wine.name}
                    className="w-16 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                    <WineIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{tasting.wine.name}</h2>
                  {tasting.wine.producer && (
                    <p className="text-sm text-muted-foreground">{tasting.wine.producer}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tasting.wine.vintage && (
                      <Badge variant="secondary">{tasting.wine.vintage}</Badge>
                    )}
                    {tasting.wine.region && (
                      <Badge variant="outline">{tasting.wine.region}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Tasting Details */}
        <Card>
          <CardHeader>
            <CardTitle>Tasting Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Rating</p>
              <StarRating rating={tasting.rating} readonly size="lg" />
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {format(new Date(tasting.tasting_date), "MMMM d, yyyy")}
              </div>
              {tasting.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {tasting.location}
                </div>
              )}
            </div>

            {tasting.occasion && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Occasion</p>
                <p>{tasting.occasion}</p>
              </div>
            )}

            {tasting.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="whitespace-pre-wrap">{tasting.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <DeleteTastingButton tastingId={tasting.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
