"use client";

import { Inbox } from "lucide-react";
import { RequestCard } from "./request-card";
import type { PendingRequest } from "@/lib/types";

interface PendingRequestsProps {
  requests: PendingRequest[];
}

export function PendingRequests({ requests }: PendingRequestsProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
        <p className="text-muted-foreground">
          Friend requests you receive will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
