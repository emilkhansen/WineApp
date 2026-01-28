"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Region } from "@/lib/types";
import { createRegion, updateRegion, deleteRegion } from "@/actions/admin";
import { ReferenceTable, type Column } from "./shared/reference-table";
import { ReferenceDialog, type FieldConfig } from "./shared/reference-dialog";
import { DeleteDialog } from "./shared/delete-dialog";

interface RegionsTabProps {
  initialData: Region[];
}

export function RegionsTab({ initialData }: RegionsTabProps) {
  const [data, setData] = useState<Region[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Region | null>(null);
  const [deletingItem, setDeletingItem] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns: Column<Region>[] = [
    { key: "name", label: "Name" },
    { key: "country", label: "Country", render: (value) => (value as string) || "-" },
  ];

  const fields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter region name" },
    { name: "country", label: "Country", type: "text", placeholder: "Enter country" },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: Region) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: Region) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, string | number | null>) => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const result = await updateRegion(
          editingItem.id,
          values.name as string,
          values.country as string | null
        );
        if (result.error) {
          toast.error(result.error);
          return;
        }
        setData((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, name: values.name as string, country: values.country as string | null }
              : item
          )
        );
        toast.success("Region updated successfully");
      } else {
        const result = await createRegion(values.name as string, values.country as string | null);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          setData((prev) => [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name)));
          toast.success("Region created successfully");
        }
      }
      setDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsLoading(true);
    try {
      const result = await deleteRegion(deletingItem.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
      toast.success("Region deleted successfully");
    } finally {
      setIsLoading(false);
      setDeletingItem(null);
    }
  };

  return (
    <>
      <ReferenceTable
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addLabel="Add Region"
        emptyMessage="No regions found"
      />
      <ReferenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Region" : "Add Region"}
        fields={fields}
        initialValues={editingItem ? { name: editingItem.name, country: editingItem.country } : undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Region"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This will also delete all associated subregions. This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </>
  );
}
