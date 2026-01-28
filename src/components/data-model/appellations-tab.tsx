"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { AppellationRef, Region, Subregion } from "@/lib/types";
import { createAppellation, updateAppellation, deleteAppellation } from "@/actions/admin";
import { ReferenceTable, type Column } from "./shared/reference-table";
import { ReferenceDialog, type FieldConfig } from "./shared/reference-dialog";
import { DeleteDialog } from "./shared/delete-dialog";

interface AppellationsTabProps {
  initialData: AppellationRef[];
  regions: Region[];
  subregions: Subregion[];
}

export function AppellationsTab({ initialData, regions, subregions }: AppellationsTabProps) {
  const [data, setData] = useState<AppellationRef[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AppellationRef | null>(null);
  const [deletingItem, setDeletingItem] = useState<AppellationRef | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const regionMap = useMemo(() => {
    return new Map(regions.map((r) => [r.id, r]));
  }, [regions]);

  const subregionMap = useMemo(() => {
    return new Map(subregions.map((s) => [s.id, s]));
  }, [subregions]);

  const columns: Column<AppellationRef>[] = [
    { key: "name", label: "Name" },
    {
      key: "region.name",
      label: "Region",
      render: (_, item) => (item.region_id ? regionMap.get(item.region_id)?.name : "-") || "-",
    },
    {
      key: "subregion.name",
      label: "Subregion",
      render: (_, item) => (item.subregion_id ? subregionMap.get(item.subregion_id)?.name : "-") || "-",
    },
  ];

  const regionOptions = regions.map((r) => ({ value: r.id, label: r.name }));
  const subregionOptions = subregions.map((s) => ({
    value: s.id,
    label: `${s.name} (${regionMap.get(s.region_id)?.name || "Unknown"})`,
  }));

  const fields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter appellation name" },
    {
      name: "region_id",
      label: "Region",
      type: "select",
      placeholder: "Select region (optional)",
      options: regionOptions,
    },
    {
      name: "subregion_id",
      label: "Subregion",
      type: "select",
      placeholder: "Select subregion (optional)",
      options: subregionOptions,
    },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: AppellationRef) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: AppellationRef) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, string | number | null>) => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const result = await updateAppellation(
          editingItem.id,
          values.name as string,
          values.region_id as string | null,
          values.subregion_id as string | null
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
                  region_id: values.region_id as string | null,
                  subregion_id: values.subregion_id as string | null,
                  region: values.region_id ? regionMap.get(values.region_id as string) : undefined,
                  subregion: values.subregion_id
                    ? subregionMap.get(values.subregion_id as string)
                    : undefined,
                }
              : item
          )
        );
        toast.success("Appellation updated successfully");
      } else {
        const result = await createAppellation(
          values.name as string,
          values.region_id as string | null,
          values.subregion_id as string | null
        );
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          setData((prev) => [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name)));
          toast.success("Appellation created successfully");
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
      const result = await deleteAppellation(deletingItem.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
      toast.success("Appellation deleted successfully");
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
        addLabel="Add Appellation"
        emptyMessage="No appellations found"
      />
      <ReferenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Appellation" : "Add Appellation"}
        fields={fields}
        initialValues={
          editingItem
            ? {
                name: editingItem.name,
                region_id: editingItem.region_id,
                subregion_id: editingItem.subregion_id,
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Appellation"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </>
  );
}
