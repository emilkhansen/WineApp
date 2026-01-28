"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { CruClassification, Region } from "@/lib/types";
import { createCruClassification, updateCruClassification, deleteCruClassification } from "@/actions/admin";
import { ReferenceTable, type Column } from "./shared/reference-table";
import { ReferenceDialog, type FieldConfig } from "./shared/reference-dialog";
import { DeleteDialog } from "./shared/delete-dialog";

interface CrusTabProps {
  initialData: CruClassification[];
  regions: Region[];
}

export function CrusTab({ initialData, regions }: CrusTabProps) {
  const [data, setData] = useState<CruClassification[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CruClassification | null>(null);
  const [deletingItem, setDeletingItem] = useState<CruClassification | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const regionMap = useMemo(() => {
    return new Map(regions.map((r) => [r.id, r]));
  }, [regions]);

  const columns: Column<CruClassification>[] = [
    { key: "name", label: "Name" },
    {
      key: "region.name",
      label: "Region",
      render: (_, item) => (item.region_id ? regionMap.get(item.region_id)?.name : "-") || "-",
    },
  ];

  const regionOptions = regions.map((r) => ({ value: r.id, label: r.name }));

  const fields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter cru classification name" },
    {
      name: "region_id",
      label: "Region",
      type: "select",
      placeholder: "Select region (optional)",
      options: regionOptions,
    },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: CruClassification) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: CruClassification) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, string | number | null>) => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const result = await updateCruClassification(
          editingItem.id,
          values.name as string,
          values.region_id as string | null
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
                  region: values.region_id ? regionMap.get(values.region_id as string) : undefined,
                }
              : item
          )
        );
        toast.success("Cru classification updated successfully");
      } else {
        const result = await createCruClassification(
          values.name as string,
          values.region_id as string | null
        );
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          setData((prev) => [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name)));
          toast.success("Cru classification created successfully");
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
      const result = await deleteCruClassification(deletingItem.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
      toast.success("Cru classification deleted successfully");
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
        addLabel="Add Cru Classification"
        emptyMessage="No cru classifications found"
      />
      <ReferenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Cru Classification" : "Add Cru Classification"}
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
        title="Delete Cru Classification"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </>
  );
}
