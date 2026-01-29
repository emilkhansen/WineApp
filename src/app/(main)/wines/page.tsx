import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WineList } from "@/components/wines/wine-list";
import { ExportWineListButton } from "@/components/wines/export-wine-list-button";
import { getWines } from "@/actions/wines";

export default async function WinesPage() {
  const wines = await getWines();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Wines</h1>
            <p className="text-muted-foreground">
              {wines.length} {wines.length === 1 ? "wine" : "wines"} in your collection
            </p>
          </div>
          {/* Desktop: buttons next to title */}
          <div className="hidden sm:flex items-center gap-2">
            <ExportWineListButton wines={wines} />
            <Link href="/wines/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Wine
              </Button>
            </Link>
          </div>
        </div>
        {/* Mobile: buttons below header */}
        <div className="flex gap-2 mt-4 sm:hidden">
          <ExportWineListButton wines={wines} />
          <Link href="/wines/add" className="flex-1">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Wine
            </Button>
          </Link>
        </div>
      </div>

      <WineList wines={wines} />
    </div>
  );
}
