"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, checkUsernameAvailable } from "@/actions/profile";

interface UsernameSetupProps {
  open: boolean;
}

export function UsernameSetup({ open }: UsernameSetupProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    setAvailable(null);

    if (value.length >= 3) {
      setChecking(true);
      const result = await checkUsernameAvailable(value);
      setChecking(false);
      setAvailable(result.available);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile({ username });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Username set successfully!");
      router.refresh();
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Set Your Username</DialogTitle>
          <DialogDescription>
            Choose a username to display to your friends. This will be visible
            when you connect with others.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                disabled={loading}
              />
              {username.length > 0 && username.length < 3 && (
                <p className="text-sm text-muted-foreground">
                  Username must be at least 3 characters
                </p>
              )}
              {checking && (
                <p className="text-sm text-muted-foreground">
                  Checking availability...
                </p>
              )}
              {available === true && !checking && (
                <p className="text-sm text-green-600">Username is available!</p>
              )}
              {available === false && !checking && (
                <p className="text-sm text-red-600">Username is already taken</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !username || username.length < 3 || available === false}
            >
              {loading ? "Saving..." : "Save Username"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
