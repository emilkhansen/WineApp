"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Color } from "@/lib/types";
import { createColor, updateColor, deleteColor } from "@/actions/admin";
import { ReferenceTable, type Column } from "./shared/reference-table";
import { ReferenceDialog, type FieldConfig } from "./shared/reference-dialog";
import { DeleteDialog } from "./shared/delete-dialog";

interface ColorsTabProps {
  initialData: Color[];
}

export function ColorsTab({ initialData }: ColorsTabProps) {
  const [data, setData] = useState<Color[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Color | null>(null);
  const [deletingItem, setDeletingItem] = useState<Color | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns: Column<Color>[] = [
    { key: "name", label: "Name" },
    { key: "sort_order", label: "Sort Order" },
  ];

  const fields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter color name" },
    { name: "sort_order", label: "Sort Order", type: "number", placeholder: "0" },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: Color) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: Color) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, string | number | null>) => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const result = await updateColor(
          editingItem.id,
          values.name as string,
          values.sort_order as number | undefined
        );
        if (result.error) {
          toast.error(result.error);
          return;
        }
        setData((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, name: values.name as string, sort_order: (values.sort_order as number) || 0 }
              : item
          )
        );
        toast.success("Color updated successfully");
      } else {
        const result = await createColor(values.name as string, (values.sort_order as number) || 0);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          setData((prev) => [...prev, result.data!].sort((a, b) => a.sort_order - b.sort_order));
          toast.success("Color created successfully");
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
      const result = await deleteColor(deletingItem.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
      toast.success("Color deleted successfully");
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
        addLabel="Add Color"
        emptyMessage="No colors found"
      />
      <ReferenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Color" : "Add Color"}
        fields={fields}
        initialValues={editingItem ? { name: editingItem.name, sort_order: editingItem.sort_order } : undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Color"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </>
  );
}
