"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, UserMinus, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeFriend } from "@/actions/friends";
import type { FriendWithProfile } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface FriendCardProps {
  friend: FriendWithProfile;
}

export function FriendCard({ friend }: FriendCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRemoveFriend = async () => {
    if (!confirm("Are you sure you want to remove this friend?")) {
      return;
    }

    setLoading(true);
    const result = await removeFriend(friend.id);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Friend removed");
      router.refresh();
    }
  };

  const profile = friend.profile;
  const displayName = profile.username || profile.email.split("@")[0];
  const initial = displayName[0].toUpperCase();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/friends/${profile.id}`}
            className="flex items-center gap-4 flex-1"
          >
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg">{initial}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{displayName}</h3>
              {profile.username && (
                <p className="text-sm text-muted-foreground truncate">
                  {profile.email}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  Friends for{" "}
                  {formatDistanceToNow(new Date(friend.created_at))}
                </span>
              </div>
            </div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={loading}>
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/friends/${profile.id}`}>View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleRemoveFriend}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Remove Friend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
