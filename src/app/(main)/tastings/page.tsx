import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTastingsWithFriends } from "@/actions/tastings";
import { TastingList } from "@/components/tastings/tasting-list";

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

      <TastingList tastings={tastings} />
    </div>
  );
}
