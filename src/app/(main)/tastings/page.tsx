import Link from "next/link";
import { Plus, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTastingsWithFriends } from "@/actions/tastings";
import { TastingListItem } from "@/components/tastings/tasting-list-item";

export default async function TastingsPage() {
  const tastings = await getTastingsWithFriends();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tastings</h1>
          <p className="text-muted-foreground">
            {tastings.length} {tastings.length === 1 ? "tasting" : "tastings"} recorded
          </p>
        </div>
        <Link href="/tastings/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Tasting
          </Button>
        </Link>
      </div>

      {tastings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Wine className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No tastings yet</h2>
          <p className="text-muted-foreground mb-4">
            Start recording your wine experiences.
          </p>
          <Link href="/tastings/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Your First Tasting
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {tastings.map((tasting) => (
            <TastingListItem key={tasting.id} tasting={tasting} />
          ))}
        </div>
      )}
    </div>
  );
}
