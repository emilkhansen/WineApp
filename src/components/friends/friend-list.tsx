"use client";

import { Users } from "lucide-react";
import { FriendCard } from "./friend-card";
import type { FriendWithProfile } from "@/lib/types";

interface FriendListProps {
  friends: FriendWithProfile[];
}

export function FriendList({ friends }: FriendListProps) {
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
        <p className="text-muted-foreground max-w-md">
          Add friends by their email address to share and discover wines
          together.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {friends.map((friend) => (
        <FriendCard key={friend.id} friend={friend} />
      ))}
    </div>
  );
}
