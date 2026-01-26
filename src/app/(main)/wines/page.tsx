import Link from "next/link";
import { Plus, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WineCard } from "@/components/wines/wine-card";
import { getWines } from "@/actions/wines";

export default async function WinesPage() {
  const wines = await getWines();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wines</h1>
          <p className="text-muted-foreground">
            {wines.length} {wines.length === 1 ? "wine" : "wines"} in your collection
          </p>
        </div>
        <Link href="/wines/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Wine
          </Button>
        </Link>
      </div>

      {wines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Wine className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No wines yet</h2>
          <p className="text-muted-foreground mb-4">
            Start building your collection by adding your first wine.
          </p>
          <Link href="/wines/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Wine
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wines.map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </div>
      )}
    </div>
  );
}
