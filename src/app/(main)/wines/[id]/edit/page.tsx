import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WineForm } from "@/components/wines/wine-form";
import { getWine } from "@/actions/wines";
import {
  getColors,
  getGrapeVarieties,
  getRegions,
  getSubregions,
  getCruClassifications,
  getAppellations,
  getProducers,
  getVineyards,
} from "@/actions/admin";

interface EditWinePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWinePage({ params }: EditWinePageProps) {
  const { id } = await params;
  const result = await getWine(id);

  if (!result || !result.isOwner) {
    notFound();
  }

  const { wine } = result;

  const [colors, grapes, regions, subregions, crus, appellations, producers, vineyards] =
    await Promise.all([
      getColors(),
      getGrapeVarieties(),
      getRegions(),
      getSubregions(),
      getCruClassifications(),
      getAppellations(),
      getProducers(),
      getVineyards(),
    ]);

  const referenceData = {
    colors,
    grapes,
    regions,
    subregions,
    crus,
    appellations,
    producers,
    vineyards,
  };

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/wines/${wine.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Wine</h1>
      </div>

      <WineForm wine={wine} referenceData={referenceData} />
    </div>
  );
}
