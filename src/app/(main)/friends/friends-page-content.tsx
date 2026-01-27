"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FriendList } from "@/components/friends/friend-list";
import { PendingRequests } from "@/components/friends/pending-requests";
import type { FriendWithProfile, PendingRequest } from "@/lib/types";

interface FriendsPageContentProps {
  friends: FriendWithProfile[];
  pendingRequests: PendingRequest[];
}

export function FriendsPageContent({
  friends,
  pendingRequests,
}: FriendsPageContentProps) {
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "friends" ? "default" : "outline"}
          onClick={() => setActiveTab("friends")}
        >
          Friends
        </Button>
        <Button
          variant={activeTab === "requests" ? "default" : "outline"}
          onClick={() => setActiveTab("requests")}
          className="relative"
        >
          Requests
          {pendingRequests.length > 0 && (
            <Badge
              variant="destructive"
              className="ml-2 h-5 min-w-5 px-1.5"
            >
              {pendingRequests.length}
            </Badge>
          )}
        </Button>
      </div>

      {activeTab === "friends" ? (
        <FriendList friends={friends} />
      ) : (
        <PendingRequests requests={pendingRequests} />
      )}
    </div>
  );
}
