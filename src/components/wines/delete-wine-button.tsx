"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteWine } from "@/actions/wines";
import { toast } from "sonner";

interface DeleteWineButtonProps {
  wineId: string;
  wineName: string;
}

export function DeleteWineButton({ wineId, wineName }: DeleteWineButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    const result = await deleteWine(wineId);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    }
    // Redirect happens in the server action
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Wine
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Wine</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{wineName}&quot;? This will
            also delete all associated tastings. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
