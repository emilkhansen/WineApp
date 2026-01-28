"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { Subregion, Region } from "@/lib/types";
import { createSubregion, updateSubregion, deleteSubregion } from "@/actions/admin";
import { ReferenceTable, type Column } from "./shared/reference-table";
import { ReferenceDialog, type FieldConfig } from "./shared/reference-dialog";
import { DeleteDialog } from "./shared/delete-dialog";

interface SubregionsTabProps {
  initialData: Subregion[];
  regions: Region[];
}

export function SubregionsTab({ initialData, regions }: SubregionsTabProps) {
  const [data, setData] = useState<Subregion[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Subregion | null>(null);
  const [deletingItem, setDeletingItem] = useState<Subregion | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const regionMap = useMemo(() => {
    return new Map(regions.map((r) => [r.id, r]));
  }, [regions]);

  const columns: Column<Subregion>[] = [
    { key: "name", label: "Name" },
    {
      key: "region.name",
      label: "Region",
      render: (_, item) => regionMap.get(item.region_id)?.name || "-",
    },
  ];

  const regionOptions = regions.map((r) => ({ value: r.id, label: r.name }));

  const fields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter subregion name" },
    {
      name: "region_id",
      label: "Region",
      type: "select",
      required: true,
      placeholder: "Select region",
      options: regionOptions,
    },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: Subregion) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: Subregion) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, string | number | null>) => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const result = await updateSubregion(
          editingItem.id,
          values.name as string,
          values.region_id as string
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
                  region_id: values.region_id as string,
                  region: regionMap.get(values.region_id as string),
                }
              : item
          )
        );
        toast.success("Subregion updated successfully");
      } else {
        const result = await createSubregion(values.name as string, values.region_id as string);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          setData((prev) => [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name)));
          toast.success("Subregion created successfully");
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
      const result = await deleteSubregion(deletingItem.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
      toast.success("Subregion deleted successfully");
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
        addLabel="Add Subregion"
        emptyMessage="No subregions found"
      />
      <ReferenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Subregion" : "Add Subregion"}
        fields={fields}
        initialValues={
          editingItem ? { name: editingItem.name, region_id: editingItem.region_id } : undefined
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Subregion"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </>
  );
}
