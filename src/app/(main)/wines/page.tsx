import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WineList } from "@/components/wines/wine-list";
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

      <WineList wines={wines} />
    </div>
  );
}
