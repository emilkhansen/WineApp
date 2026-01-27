"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { acceptFriendRequest, rejectFriendRequest } from "@/actions/friends";
import type { PendingRequest } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface RequestCardProps {
  request: PendingRequest;
}

export function RequestCard({ request }: RequestCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    const result = await acceptFriendRequest(request.id);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Friend request accepted!");
      router.refresh();
    }
  };

  const handleReject = async () => {
    setLoading(true);
    const result = await rejectFriendRequest(request.id);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Friend request declined");
      router.refresh();
    }
  };

  const sender = request.sender;
  const displayName = sender.username || sender.email.split("@")[0];
  const initial = displayName[0].toUpperCase();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{displayName}</h4>
              <p className="text-sm text-muted-foreground truncate">
                {sender.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Sent {formatDistanceToNow(new Date(request.created_at))} ago
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleAccept} disabled={loading}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
