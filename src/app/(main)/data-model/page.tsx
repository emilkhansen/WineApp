import { redirect } from "next/navigation";
import {
  checkIsAdmin,
  getColors,
  getGrapeVarieties,
  getRegions,
  getSubregions,
  getCommunes,
  getCruClassifications,
  getAppellations,
  getProducers,
  getVineyards,
} from "@/actions/admin";
import { DataModelContent } from "./data-model-content";

export default async function DataModelPage() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    redirect("/");
  }

  const [colors, grapes, regions, subregions, communes, crus, appellations, producers, vineyards] =
    await Promise.all([
      getColors(),
      getGrapeVarieties(),
      getRegions(),
      getSubregions(),
      getCommunes(),
      getCruClassifications(),
      getAppellations(),
      getProducers(),
      getVineyards(),
    ]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Data Model</h1>
      <p className="text-muted-foreground mb-8">
        Manage wine reference data for data integrity
      </p>
      <DataModelContent
        colors={colors}
        grapes={grapes}
        regions={regions}
        subregions={subregions}
        communes={communes}
        crus={crus}
        appellations={appellations}
        producers={producers}
        vineyards={vineyards}
      />
    </div>
  );
}
