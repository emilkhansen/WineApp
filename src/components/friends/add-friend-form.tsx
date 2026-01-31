"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { sendFriendRequest } from "@/actions/friends";

interface AddFriendFormProps {
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  /** If provided, emails are passed to this callback instead of sending friend requests */
  onEmailsAdded?: (emails: string[]) => void;
}

export function AddFriendForm({
  buttonText = "Add Friend",
  buttonVariant = "default",
  buttonSize = "default",
  onEmailsAdded,
}: AddFriendFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const parseAndAddEmails = (value: string) => {
    const newEmails = value
      .split(/[,\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes("@") && !emails.includes(e));

    if (newEmails.length > 0) {
      setEmails((prev) => [...prev, ...newEmails]);
      setInputValue("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If user types or pastes a comma, parse emails
    if (value.includes(",")) {
      parseAndAddEmails(value);
    } else {
      setInputValue(value);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      parseAndAddEmails(inputValue);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      parseAndAddEmails(inputValue);
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add any remaining input as email
    const allEmails = [...emails];
    if (inputValue.trim() && inputValue.includes("@")) {
      const trimmed = inputValue.trim().toLowerCase();
      if (!allEmails.includes(trimmed)) {
        allEmails.push(trimmed);
      }
    }

    if (allEmails.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    // If callback provided, just pass emails and close
    if (onEmailsAdded) {
      onEmailsAdded(allEmails);
      setEmails([]);
      setInputValue("");
      setOpen(false);
      return;
    }

    // Otherwise send friend requests
    setLoading(true);

    const results = await Promise.all(
      allEmails.map((email) => sendFriendRequest(email))
    );

    setLoading(false);

    const errors = results.filter((r) => r.error);
    const successes = results.filter((r) => !r.error);

    if (successes.length > 0) {
      toast.success(
        successes.length === 1
          ? "Friend request sent!"
          : `${successes.length} friend requests sent!`
      );
    }

    if (errors.length > 0) {
      errors.forEach((r) => toast.error(r.error));
    }

    if (successes.length > 0) {
      setEmails([]);
      setInputValue("");
      setOpen(false);
      router.refresh();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setEmails([]);
      setInputValue("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          <UserPlus className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friends</DialogTitle>
          <DialogDescription>
            Enter email addresses to add friends. You can add multiple emails separated by commas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Addresses</Label>
              {emails.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {emails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="pl-2 pr-1 py-1 flex items-center gap-1"
                    >
                      <span className="text-xs">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeEmail(email)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <Input
                id="email"
                type="text"
                placeholder="friend@example.com, another@example.com"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onBlur={handleInputBlur}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Press Enter or use commas to add multiple emails
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (emails.length === 0 && !inputValue.trim())}>
              {loading
                ? "Adding..."
                : emails.length > 1
                ? `Add ${emails.length} Friends`
                : "Add Friend"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
