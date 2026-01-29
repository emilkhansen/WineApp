"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { Commune, Subregion } from "@/lib/types";
import { createCommune, updateCommune, deleteCommune } from "@/actions/admin";
import { ReferenceTable, type Column } from "./shared/reference-table";
import { ReferenceDialog, type FieldConfig } from "./shared/reference-dialog";
import { DeleteDialog } from "./shared/delete-dialog";

interface CommunesTabProps {
  initialData: Commune[];
  subregions: Subregion[];
}

export function CommunesTab({ initialData, subregions }: CommunesTabProps) {
  const [data, setData] = useState<Commune[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Commune | null>(null);
  const [deletingItem, setDeletingItem] = useState<Commune | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const subregionMap = useMemo(() => {
    return new Map(subregions.map((s) => [s.id, s]));
  }, [subregions]);

  const columns: Column<Commune>[] = [
    { key: "name", label: "Name" },
    {
      key: "subregion.name",
      label: "Subregion",
      render: (_, item) => {
        const subregion = subregionMap.get(item.subregion_id);
        return subregion ? `${subregion.name} (${subregion.region?.name || ""})` : "-";
      },
    },
  ];

  const subregionOptions = subregions.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.region?.name || ""})`,
  }));

  const fields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter commune name" },
    {
      name: "subregion_id",
      label: "Subregion",
      type: "select",
      required: true,
      placeholder: "Select subregion",
      options: subregionOptions,
    },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: Commune) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: Commune) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, string | number | null>) => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const result = await updateCommune(
          editingItem.id,
          values.name as string,
          values.subregion_id as string
        );
        if (result.error) {
          toast.error(result.error);
          return;
        }
        setData((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  name: values.name as string,
                  subregion_id: values.subregion_id as string,
                  subregion: subregionMap.get(values.subregion_id as string),
                }
              : item
          )
        );
        toast.success("Commune updated successfully");
      } else {
        const result = await createCommune(values.name as string, values.subregion_id as string);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          setData((prev) => [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name)));
          toast.success("Commune created successfully");
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
      const result = await deleteCommune(deletingItem.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
      toast.success("Commune deleted successfully");
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
        addLabel="Add Commune"
        emptyMessage="No communes found"
      />
      <ReferenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Commune" : "Add Commune"}
        fields={fields}
        initialValues={
          editingItem ? { name: editingItem.name, subregion_id: editingItem.subregion_id } : undefined
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Commune"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </>
  );
}
