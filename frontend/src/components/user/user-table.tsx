"use client"

import { User } from "@/app/lib/types"
import { DataTable } from "@/components/shared/data-table"
import {  getUserTableConfig } from "@/components/shared/table-configs/user-table-config"

interface UserTableProps {
  users: User[]
  onDeleteUser: (id: number) => void
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
