"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { Vineyard, Region, AppellationRef } from "@/lib/types";
import { createVineyard, updateVineyard, deleteVineyard } from "@/actions/admin";
import { ReferenceTable, type Column } from "./shared/reference-table";
import { ReferenceDialog, type FieldConfig } from "./shared/reference-dialog";
import { DeleteDialog } from "./shared/delete-dialog";

interface VineyardsTabProps {
  initialData: Vineyard[];
  regions: Region[];
  appellations: AppellationRef[];
}

export function VineyardsTab({ initialData, regions, appellations }: VineyardsTabProps) {
  const [data, setData] = useState<Vineyard[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vineyard | null>(null);
  const [deletingItem, setDeletingItem] = useState<Vineyard | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const regionMap = useMemo(() => {
    return new Map(regions.map((r) => [r.id, r]));
  }, [regions]);

  const appellationMap = useMemo(() => {
    return new Map(appellations.map((a) => [a.id, a]));
  }, [appellations]);

  const columns: Column<Vineyard>[] = [
    { key: "name", label: "Name" },
    {
      key: "region.name",
      label: "Region",
      render: (_, item) => (item.region_id ? regionMap.get(item.region_id)?.name : "-") || "-",
    },
    {
      key: "appellation.name",
      label: "Appellation",
      render: (_, item) =>
        (item.appellation_id ? appellationMap.get(item.appellation_id)?.name : "-") || "-",
    },
  ];

  const regionOptions = regions.map((r) => ({ value: r.id, label: r.name }));
  const appellationOptions = appellations.map((a) => ({
    value: a.id,
    label: a.region_id
      ? `${a.name} (${regionMap.get(a.region_id)?.name || "Unknown"})`
      : a.name,
  }));

  const fields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter vineyard name" },
    {
      name: "region_id",
      label: "Region",
      type: "select",
      placeholder: "Select region (optional)",
      options: regionOptions,
    },
    {
      name: "appellation_id",
      label: "Appellation",
      type: "select",
      placeholder: "Select appellation (optional)",
      options: appellationOptions,
    },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: Vineyard) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: Vineyard) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, string | number | null>) => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const result = await updateVineyard(
          editingItem.id,
          values.name as string,
          values.region_id as string | null,
          values.appellation_id as string | null
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
                  appellation_id: values.appellation_id as string | null,
                  region: values.region_id ? regionMap.get(values.region_id as string) : undefined,
                  appellation: values.appellation_id
                    ? appellationMap.get(values.appellation_id as string)
                    : undefined,
                }
              : item
          )
        );
        toast.success("Vineyard updated successfully");
      } else {
        const result = await createVineyard(
          values.name as string,
          values.region_id as string | null,
          values.appellation_id as string | null
        );
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          setData((prev) => [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name)));
          toast.success("Vineyard created successfully");
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
      const result = await deleteVineyard(deletingItem.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
      toast.success("Vineyard deleted successfully");
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
        addLabel="Add Vineyard"
        emptyMessage="No vineyards found"
      />
      <ReferenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Vineyard" : "Add Vineyard"}
        fields={fields}
        initialValues={
          editingItem
            ? {
                name: editingItem.name,
                region_id: editingItem.region_id,
                appellation_id: editingItem.appellation_id,
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Vineyard"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </>
  );
}
