import {
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
import { AddWineClient } from "./add-wine-client";

export default async function AddWinePage() {
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

  const referenceData = {
    colors,
    grapes,
    regions,
    subregions,
    communes,
    crus,
    appellations,
    producers,
    vineyards,
  };

  return <AddWineClient referenceData={referenceData} />;
}
