"use client";

import Image from "next/image";
import { FriendCard } from "./friend-card";
import { AddFriendForm } from "./add-friend-form";
import type { FriendWithProfile } from "@/lib/types";

interface FriendListProps {
  friends: FriendWithProfile[];
}

export function FriendList({ friends }: FriendListProps) {
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Image
          src="/winesclinking-nobg.png"
          alt="Wine glasses clinking"
          width={200}
          height={200}
          className="mb-4 opacity-80"
        />
        <h3 className="text-lg font-semibold mb-2">Wine is better shared</h3>
        <p className="text-muted-foreground max-w-md mb-4">
          Add friends to share tastings and discover new wines together.
        </p>
        <AddFriendForm buttonText="Send Your First Invite" />
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
