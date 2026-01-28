import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wine as WineIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getFriendProfile, getFriendWines, getFriendTastings } from "@/actions/friends";
import { TastingListItem } from "@/components/tastings/tasting-list-item";
import { formatDistanceToNow } from "date-fns";

interface FriendProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function FriendProfilePage({
  params,
}: FriendProfilePageProps) {
  const { id } = await params;
  const profile = await getFriendProfile(id);

  if (!profile) {
    notFound();
  }

  const wines = await getFriendWines(id);
  const tastings = await getFriendTastings(id);

  const displayName = profile.username || profile.email.split("@")[0];
  const initial = displayName[0].toUpperCase();

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/friends">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex-1">{displayName}&apos;s Profile</h1>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{displayName}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Member for {formatDistanceToNow(new Date(profile.created_at))}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Public Wines */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Public Wines ({wines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {wines.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No public wines shared yet
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {wines.map((wine) => (
                <div
                  key={wine.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  {wine.image_url ? (
                    <img
                      src={wine.image_url}
                      alt={wine.name}
                      className="w-16 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                      <WineIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{wine.name}</h4>
                    {wine.producer && (
                      <p className="text-sm text-muted-foreground truncate">
                        {wine.producer}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {wine.vintage && (
                        <Badge variant="secondary">{wine.vintage}</Badge>
                      )}
                      {wine.region && (
                        <Badge variant="outline">{wine.region}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Tastings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tastings ({tastings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tastings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tastings on public wines yet
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
    </div>
  );
}
