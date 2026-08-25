"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRolesStore } from "@/stores/roles-store";
import {
  usePermissionsStore,
  ALL_PERMISSION_MODULES,
  type PermissionEntry,
  type PermissionModule,
} from "@/stores/permissions-store";
import { Loader } from "@/components/loader";

const MODULE_LABELS: Record<PermissionModule, string> = {
  TRUCKS: "Trucks",
  DRIVERS: "Drivers",
  CLIENTS: "Clients",
  SUBCONTRACTORS: "Subcontractors",
  MISSIONS: "Missions",
  CLIENT_INVOICES: "Client Invoices",
  SUBCONTRACTOR_BILLS: "Subcontractor Bills",
  DASHBOARD: "Dashboard",
  REPORTS: "Reports",
};

export default function PermissionsPage() {
  const { roles, fetchRoles } = useRolesStore();
  const { permissions, loading, saving, error, fetchPermissions, savePermissions, clearError } =
    usePermissionsStore();

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [entries, setEntries] = useState<Record<PermissionModule, PermissionEntry>>(() =>
    buildDefaultEntries()
  );

  useEffect(() => {
    fetchRoles({ limit: 100 });
  }, [fetchRoles]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (selectedRoleId) {
      fetchPermissions(Number(selectedRoleId));
    }
  }, [selectedRoleId, fetchPermissions]);

  useEffect(() => {
    const next = buildDefaultEntries();
    permissions.forEach((p) => {
      next[p.module] = {
        module: p.module,
        canCreate: p.canCreate,
        canRead: p.canRead,
        canUpdate: p.canUpdate,
        canDelete: p.canDelete,
      };
    });
    setEntries(next);
  }, [permissions]);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id.toString() === selectedRoleId),
    [roles, selectedRoleId]
  );

  const toggle = (module: PermissionModule, field: keyof Omit<PermissionEntry, "module">) => {
    setEntries((prev) => ({
      ...prev,
      [module]: { ...prev[module], [field]: !prev[module][field] },
    }));
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    try {
      await savePermissions(Number(selectedRoleId), Object.values(entries));
      toast.success("Permissions saved");
    } catch {
      toast.error("Failed to save permissions");
    }
  };

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold">Permissions</h1>
        <p className="text-muted-foreground">
          Grant a role create/read/update/delete access per module. The "admin" role always has
          full access regardless of what's set here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <div className="flex items-center gap-3">
              <Label htmlFor="role-select" className="font-normal text-muted-foreground">
                Role
              </Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="role-select" className="w-[240px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedRoleId ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Select a role to view and edit its module permissions.
            </p>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader size={20} />
            </div>
          ) : (
            <div className="space-y-4">
              {selectedRole?.name.toLowerCase() === "admin" && (
                <p className="text-sm text-muted-foreground">
                  This role already has full access as the admin role — grants below have no effect.
                </p>
              )}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead className="text-center">Create</TableHead>
                      <TableHead className="text-center">Read</TableHead>
                      <TableHead className="text-center">Update</TableHead>
                      <TableHead className="text-center">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ALL_PERMISSION_MODULES.map((module) => (
                      <TableRow key={module}>
                        <TableCell className="font-medium">{MODULE_LABELS[module]}</TableCell>
                        {(["canCreate", "canRead", "canUpdate", "canDelete"] as const).map((field) => (
                          <TableCell key={field} className="text-center">
                            <Checkbox
                              checked={entries[module][field]}
                              onCheckedChange={() => toggle(module, field)}
                              aria-label={`${MODULE_LABELS[module]} ${field}`}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <span className="flex items-center">
                      <Loader size={16} />
                      <span className="ml-2">Saving...</span>
                    </span>
                  ) : (
                    "Save Permissions"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function buildDefaultEntries(): Record<PermissionModule, PermissionEntry> {
  return ALL_PERMISSION_MODULES.reduce((acc, module) => {
    acc[module] = { module, canCreate: false, canRead: false, canUpdate: false, canDelete: false };
    return acc;
  }, {} as Record<PermissionModule, PermissionEntry>);
}
