"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type {
  Color,
  GrapeVarietyRef,
  Region,
  Subregion,
  Commune,
  CruClassification,
  AppellationRef,
  Producer,
  Vineyard,
} from "@/lib/types";
import { ColorsTab } from "@/components/data-model/colors-tab";
import { GrapesTab } from "@/components/data-model/grapes-tab";
import { RegionsTab } from "@/components/data-model/regions-tab";
import { SubregionsTab } from "@/components/data-model/subregions-tab";
import { CommunesTab } from "@/components/data-model/communes-tab";
import { CrusTab } from "@/components/data-model/crus-tab";
import { AppellationsTab } from "@/components/data-model/appellations-tab";
import { ProducersTab } from "@/components/data-model/producers-tab";
import { VineyardsTab } from "@/components/data-model/vineyards-tab";

interface DataModelContentProps {
  colors: Color[];
  grapes: GrapeVarietyRef[];
  regions: Region[];
  subregions: Subregion[];
  communes: Commune[];
  crus: CruClassification[];
  appellations: AppellationRef[];
  producers: Producer[];
  vineyards: Vineyard[];
}

type TabKey =
  | "colors"
  | "grapes"
  | "regions"
  | "subregions"
  | "communes"
  | "crus"
  | "appellations"
  | "producers"
  | "vineyards";

interface TabConfig {
  key: TabKey;
  label: string;
  count: number;
}

export function DataModelContent({
  colors,
  grapes,
  regions,
  subregions,
  communes,
  crus,
  appellations,
  producers,
  vineyards,
}: DataModelContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("colors");

  const tabs: TabConfig[] = [
    { key: "colors", label: "Colors", count: colors.length },
    { key: "grapes", label: "Grapes", count: grapes.length },
    { key: "regions", label: "Regions", count: regions.length },
    { key: "subregions", label: "Subregions", count: subregions.length },
    { key: "communes", label: "Communes", count: communes.length },
    { key: "crus", label: "Crus", count: crus.length },
    { key: "appellations", label: "Appellations", count: appellations.length },
    { key: "producers", label: "Producers", count: producers.length },
    { key: "vineyards", label: "Vineyards", count: vineyards.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-1.5 px-1.5 py-0.5 text-xs rounded-full",
                activeTab === tab.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div>
        {activeTab === "colors" && <ColorsTab initialData={colors} />}
        {activeTab === "grapes" && <GrapesTab initialData={grapes} />}
        {activeTab === "regions" && <RegionsTab initialData={regions} />}
        {activeTab === "subregions" && (
          <SubregionsTab initialData={subregions} regions={regions} />
        )}
        {activeTab === "communes" && (
          <CommunesTab initialData={communes} subregions={subregions} />
        )}
        {activeTab === "crus" && (
          <CrusTab initialData={crus} regions={regions} />
        )}
        {activeTab === "appellations" && (
          <AppellationsTab
            initialData={appellations}
            regions={regions}
            subregions={subregions}
          />
        )}
        {activeTab === "producers" && (
          <ProducersTab initialData={producers} regions={regions} />
        )}
        {activeTab === "vineyards" && (
          <VineyardsTab
            initialData={vineyards}
            regions={regions}
            appellations={appellations}
          />
        )}
      </div>
    </div>
  );
}
