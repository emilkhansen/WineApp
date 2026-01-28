import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getFriendProfile, getFriendWines, getFriendTastings } from "@/actions/friends";
import { FriendProfileTabs } from "@/components/friends/friend-profile-tabs";
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

      {/* Tabs and Content */}
      <FriendProfileTabs wines={wines} tastings={tastings} />
    </div>
  );
}
