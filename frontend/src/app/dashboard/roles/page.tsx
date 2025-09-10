"use client"

import { CreateRoleDialog } from "@/components/role/create-role-dialog"
import { EditRoleDialog } from "@/components/role/edit-role-dialog"
import { RoleTable } from "@/components/role/role-table"
import { useState } from "react"


export interface Role {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: "Administrator",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      name: "Manager",
      createdAt: "2024-01-16T14:20:00Z",
      updatedAt: "2024-01-16T14:20:00Z",
    },
    {
      id: 3,
      name: "Employee",
      createdAt: "2024-01-17T09:15:00Z",
      updatedAt: "2024-01-17T09:15:00Z",
    },
  ])

  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const handleCreateRole = (roleData: { name: string }) => {
    const newRole: Role = {
      id: Math.max(...roles.map((r) => r.id)) + 1,
      name: roleData.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setRoles([...roles, newRole])
  }

  const handleEditRole = (roleData: { name: string }) => {
    if (!editingRole) return

    const updatedRoles = roles.map((role) =>
      role.id === editingRole.id ? { ...role, name: roleData.name, updatedAt: new Date().toISOString() } : role,
    )
    setRoles(updatedRoles)
    setEditingRole(null)
  }

  const handleDeleteRole = (roleId: number) => {
    setRoles(roles.filter((role) => role.id !== roleId))
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
        <CreateRoleDialog onCreateRole={handleCreateRole} />
      </div>
      <RoleTable roles={roles} onEditRole={setEditingRole} onDeleteRole={handleDeleteRole} />
      {editingRole && (
        <EditRoleDialog
          role={editingRole}
          open={!!editingRole}
          onOpenChange={(open) => !open && setEditingRole(null)}
          onEditRole={handleEditRole}
        />
      )}
    </div>
  )
}
