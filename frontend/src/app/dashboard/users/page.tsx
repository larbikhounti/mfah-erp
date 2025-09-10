"use client"

import { useState } from "react"
import { User, UserTable } from "./components/user-table"
import { CreateUserDialog } from "./components/create-user-dialog"
import { EditUserDialog } from "./components/edit-user-dialog"


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "backoffice",
      dom: "dom1",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "front office",
      dom: "dom2",
    },
  ])

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleCreateUser = (userData: Omit<User, "id">) => {
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
    }
    setUsers([...users, newUser])
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setEditingUser(null)
    setIsEditDialogOpen(false)
  }

  const handleCloseEditDialog = () => {
    setEditingUser(null)
    setIsEditDialogOpen(false)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex  justify-between ">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <CreateUserDialog onCreateUser={handleCreateUser} />
      </div>
      <UserTable users={users} onDeleteUser={handleDeleteUser} onEditUser={handleEditUser} />

      <EditUserDialog
        user={editingUser}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onEditUser={handleUpdateUser}
      />
    </div>
  )
}
