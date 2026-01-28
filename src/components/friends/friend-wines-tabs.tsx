"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WineTable } from "@/components/wines/wine-table";
import type { Wine } from "@/lib/types";

interface FriendWinesTabsProps {
  wines: Wine[];
}

export function FriendWinesTabs({ wines }: FriendWinesTabsProps) {
  const [activeTab, setActiveTab] = useState<"all" | "public">("all");

  const publicWines = wines.filter((w) => w.is_public);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Wines</CardTitle>
          <div className="flex gap-1">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("all")}
            >
              All ({wines.length})
            </Button>
            <Button
              variant={activeTab === "public" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("public")}
            >
              Public ({publicWines.length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === "all" ? (
          <WineTable
            wines={wines}
            showVisibilityToggle={false}
            emptyMessage="No wines shared yet"
          />
        ) : (
          <WineTable
            wines={publicWines}
            showVisibilityToggle={false}
            emptyMessage="No public wines shared yet"
          />
        )}
      </CardContent>
    </Card>
  );
}
