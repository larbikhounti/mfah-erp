"use client"

import { DataTable } from "@/components/shared/data-table"
import { User, getUserTableConfig } from "@/components/shared/table-configs/user-table-config"

interface UserTableProps {
  users: User[]
  onDeleteUser: (id: string) => void
  onEditUser: (user: User) => void
}

export function UserTable({ users, onDeleteUser, onEditUser }: UserTableProps) {
  const tableConfig = getUserTableConfig(onEditUser, onDeleteUser)

  return (
    <DataTable
      title="User Management"
      data={users}
      {...tableConfig}
    />
  )
}

export type { User }
