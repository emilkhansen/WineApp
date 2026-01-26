import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Wine as WineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getWine } from "@/actions/wines";
import { getTastingsForWine } from "@/actions/tastings";
import { StockAdjuster } from "@/components/wines/stock-adjuster";
import { DeleteWineButton } from "@/components/wines/delete-wine-button";
import { TastingListItem } from "@/components/tastings/tasting-list-item";

interface WineDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WineDetailPage({ params }: WineDetailPageProps) {
  const { id } = await params;
  const wine = await getWine(id);

  if (!wine) {
    notFound();
  }

  const tastings = await getTastingsForWine(id);

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/wines">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex-1">{wine.name}</h1>
        <Link href={`/wines/${wine.id}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-6">
                {wine.image_url ? (
                  <img
                    src={wine.image_url}
                    alt={wine.name}
                    className="w-32 h-40 object-cover rounded"
                  />
                ) : (
                  <div className="w-32 h-40 bg-muted rounded flex items-center justify-center">
                    <WineIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-4">
                  {wine.producer && (
                    <div>
                      <p className="text-sm text-muted-foreground">Producer</p>
                      <p className="font-medium">{wine.producer}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {wine.vintage && <Badge variant="secondary">{wine.vintage}</Badge>}
                    {wine.region && <Badge variant="outline">{wine.region}</Badge>}
                    {wine.grape_variety && (
                      <Badge variant="outline">{wine.grape_variety}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                {wine.appellation && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Appellation</dt>
                    <dd className="font-medium">{wine.appellation}</dd>
                  </div>
                )}
                {wine.vineyard && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Vineyard</dt>
                    <dd className="font-medium">{wine.vineyard}</dd>
                  </div>
                )}
                {wine.alcohol_percentage && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Alcohol</dt>
                    <dd className="font-medium">{wine.alcohol_percentage}%</dd>
                  </div>
                )}
                {wine.bottle_size && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Bottle Size</dt>
                    <dd className="font-medium">{wine.bottle_size}</dd>
                  </div>
                )}
                {wine.importer && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Importer</dt>
                    <dd className="font-medium">{wine.importer}</dd>
                  </div>
                )}
              </dl>
              {wine.winemaker_notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Winemaker Notes
                    </p>
                    <p className="text-sm">{wine.winemaker_notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tastings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tastings ({tastings.length})</CardTitle>
              <Link href={`/tastings/add?wine=${wine.id}`}>
                <Button size="sm">Add Tasting</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {tastings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No tastings recorded yet
                </p>
              ) : (
                <div className="space-y-3">
                  {tastings.map((tasting) => (
                    <TastingListItem key={tasting.id} tasting={tasting} showWine={false} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <StockAdjuster wineId={wine.id} currentStock={wine.stock} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <DeleteWineButton wineId={wine.id} wineName={wine.name} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
