"use client";

import { useState, useEffect } from "react";
import { Check, Users, X, UserPlus } from "lucide-react";
import { AddFriendForm } from "@/components/friends/add-friend-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getFriends } from "@/actions/friends";
import type { FriendWithProfile } from "@/lib/types";

interface FriendSelectorProps {
  selectedFriendIds: string[];
  onFriendsChange: (friendIds: string[]) => void;
  pendingInviteEmails?: string[];
  onPendingInviteEmailsChange?: (emails: string[]) => void;
  className?: string;
}

export function FriendSelector({
  selectedFriendIds,
  onFriendsChange,
  pendingInviteEmails = [],
  onPendingInviteEmailsChange,
  className,
}: FriendSelectorProps) {
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadFriends() {
      const data = await getFriends();
      setFriends(data);
      setLoading(false);
    }
    loadFriends();
  }, []);

  const toggleFriend = (friendId: string) => {
    if (selectedFriendIds.includes(friendId)) {
      onFriendsChange(selectedFriendIds.filter((id) => id !== friendId));
    } else {
      onFriendsChange([...selectedFriendIds, friendId]);
    }
  };

  const removeFriend = (friendId: string) => {
    onFriendsChange(selectedFriendIds.filter((id) => id !== friendId));
  };

  const selectedFriends = friends.filter((f) =>
    selectedFriendIds.includes(f.profile.id)
  );

  const handleEmailsAdded = (emails: string[]) => {
    if (onPendingInviteEmailsChange) {
      const newEmails = emails.filter((e) => !pendingInviteEmails.includes(e));
      onPendingInviteEmailsChange([...pendingInviteEmails, ...newEmails]);
    }
  };

  const removeInviteEmail = (email: string) => {
    if (onPendingInviteEmailsChange) {
      onPendingInviteEmailsChange(pendingInviteEmails.filter((e) => e !== email));
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <Label className="text-sm text-muted-foreground">Tasted with</Label>
        <div className="mt-2 text-sm text-muted-foreground">Loading friends...</div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className={cn("pt-4 border-t border-dashed", className)}>
        {pendingInviteEmails.length > 0 && (
          <div className="mb-3">
            <Label className="text-sm">Inviting to this tasting</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {pendingInviteEmails.map((email) => (
                <Badge
                  key={email}
                  variant="outline"
                  className="pl-2 pr-1 py-1 flex items-center gap-1 border-dashed"
                >
                  <span className="text-xs">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeInviteEmail(email)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserPlus className="h-4 w-4 shrink-0" />
          <span>{pendingInviteEmails.length > 0 ? "Invite more?" : "Tasting with someone?"}</span>
          <AddFriendForm
            buttonText="Invite them"
            buttonVariant="link"
            buttonSize="sm"
            onEmailsAdded={onPendingInviteEmailsChange ? handleEmailsAdded : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Label className="text-sm">Tasted with</Label>
      <div className="mt-2 space-y-2">
        {/* Selected friends as badges */}
        {(selectedFriends.length > 0 || pendingInviteEmails.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {selectedFriends.map((friend) => (
              <Badge
                key={friend.profile.id}
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-1"
              >
                <span>{friend.profile.username || friend.profile.email}</span>
                <button
                  type="button"
                  onClick={() => removeFriend(friend.profile.id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {/* Pending invite emails */}
            {pendingInviteEmails.map((email) => (
              <Badge
                key={email}
                variant="outline"
                className="pl-2 pr-1 py-1 flex items-center gap-1 border-dashed"
              >
                <span className="text-xs">{email}</span>
                <span className="text-xs text-muted-foreground">(invite)</span>
                <button
                  type="button"
                  onClick={() => removeInviteEmail(email)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Buttons for selecting friends and inviting new people */}
        <div className="flex flex-wrap gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Users className="h-4 w-4 mr-2" />
                {selectedFriends.length > 0 ? "Edit friends" : "Add friends"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-1">
                {friends.map((friend) => {
                  const isSelected = selectedFriendIds.includes(friend.profile.id);
                  return (
                    <button
                      key={friend.profile.id}
                      type="button"
                      onClick={() => toggleFriend(friend.profile.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="truncate">
                        {friend.profile.username || friend.profile.email}
                      </span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
          {onPendingInviteEmailsChange && (
            <AddFriendForm
              buttonText="Invite someone new"
              buttonVariant="outline"
              buttonSize="sm"
              onEmailsAdded={handleEmailsAdded}
            />
          )}
        </div>
      </div>
    </div>
  );
}
