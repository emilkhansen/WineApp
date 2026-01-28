"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WineTable } from "@/components/wines/wine-table";
import { TastingListItem } from "@/components/tastings/tasting-list-item";
import type { Wine, Tasting } from "@/lib/types";

interface FriendProfileTabsProps {
  wines: Wine[];
  tastings: (Tasting & { wine: Wine })[];
}

export function FriendProfileTabs({ wines, tastings }: FriendProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"info" | "wines">("info");

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "info" ? "default" : "outline"}
          onClick={() => setActiveTab("info")}
        >
          Info
        </Button>
        <Button
          variant={activeTab === "wines" ? "default" : "outline"}
          onClick={() => setActiveTab("wines")}
        >
          Wines ({wines.length})
        </Button>
      </div>

      {activeTab === "info" ? (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{wines.length}</p>
                  <p className="text-muted-foreground">Public Wines</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{tastings.length}</p>
                  <p className="text-muted-foreground">Tastings</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tastings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tastings ({tastings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tastings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tastings yet
                </p>
              ) : (
                <div className="space-y-3">
                  {tastings.slice(0, 10).map((tasting) => (
                    <TastingListItem
                      key={tasting.id}
                      tasting={{ ...tasting, wine: tasting.wine }}
                      showWine={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Public Wines ({wines.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <WineTable
              wines={wines}
              showVisibilityToggle={false}
              emptyMessage="No public wines shared yet"
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
