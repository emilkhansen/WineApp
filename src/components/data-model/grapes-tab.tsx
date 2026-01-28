"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { GrapeVarietyRef } from "@/lib/types";
import { createGrapeVariety, updateGrapeVariety, deleteGrapeVariety } from "@/actions/admin";
import { ReferenceTable, type Column } from "./shared/reference-table";
import { ReferenceDialog, type FieldConfig } from "./shared/reference-dialog";
import { DeleteDialog } from "./shared/delete-dialog";

interface GrapesTabProps {
  initialData: GrapeVarietyRef[];
}

const GRAPE_COLOR_OPTIONS = [
  { value: "red", label: "Red" },
  { value: "white", label: "White" },
  { value: "rosé", label: "Rosé" },
  { value: "sparkling", label: "Sparkling" },
];

export function GrapesTab({ initialData }: GrapesTabProps) {
  const [data, setData] = useState<GrapeVarietyRef[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrapeVarietyRef | null>(null);
  const [deletingItem, setDeletingItem] = useState<GrapeVarietyRef | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns: Column<GrapeVarietyRef>[] = [
    { key: "name", label: "Name" },
    {
      key: "color",
      label: "Color",
      render: (value) => {
        const colorLabel = GRAPE_COLOR_OPTIONS.find((opt) => opt.value === value)?.label;
        return colorLabel || (value as string) || "-";
      },
    },
  ];

  const fields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter grape variety name" },
    {
      name: "color",
      label: "Color",
      type: "select",
      placeholder: "Select color",
      options: GRAPE_COLOR_OPTIONS,
    },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: GrapeVarietyRef) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: GrapeVarietyRef) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, string | number | null>) => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const result = await updateGrapeVariety(
          editingItem.id,
          values.name as string,
          values.color as string | null
        );
        if (result.error) {
          toast.error(result.error);
          return;
        }
        setData((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, name: values.name as string, color: values.color as string | null }
              : item
          )
        );
        toast.success("Grape variety updated successfully");
      } else {
        const result = await createGrapeVariety(values.name as string, values.color as string | null);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          setData((prev) => [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name)));
          toast.success("Grape variety created successfully");
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
      const result = await deleteGrapeVariety(deletingItem.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
      toast.success("Grape variety deleted successfully");
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
        addLabel="Add Grape Variety"
        emptyMessage="No grape varieties found"
      />
      <ReferenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Grape Variety" : "Add Grape Variety"}
        fields={fields}
        initialValues={editingItem ? { name: editingItem.name, color: editingItem.color } : undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Grape Variety"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </>
  );
}
