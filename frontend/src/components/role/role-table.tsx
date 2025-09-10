"use client"

import { DataTable } from "@/components/shared/data-table"
import { getBasicTableConfig } from "@/components/shared/table-configs/basic-table-config"
import { Badge } from "@/components/ui/badge"
import { Role } from "@/app/dashboard/roles/page"

interface RoleTableProps {
  roles: Role[]
  onEditRole: (role: Role) => void
  onDeleteRole: (roleId: number) => void
}

export function RoleTable({ roles, onEditRole, onDeleteRole }: RoleTableProps) {
  const tableConfig = getBasicTableConfig(onEditRole, onDeleteRole, "Search roles...")

  // Override the name column to include Badge styling
  const customConfig = {
    ...tableConfig,
    columns: [
      {
        key: "name",
        label: "Name",
        render: (role: Role) => <Badge variant="secondary">{role.name}</Badge>
      },
      ...tableConfig.columns.slice(1), // Keep the other columns as is
    ],
  }

  return (
    <DataTable
      title="Role Management"
      data={roles}
      {...customConfig}
    />
  )
}
