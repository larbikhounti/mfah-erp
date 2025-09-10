"use client"

import { CreateUserDialog } from "@/components/user/create-user-dialog"
import { EditUserDialog } from "@/components/user/edit-user-dialog"
import { User, UserTable } from "@/components/user/user-table"
import { useState } from "react"



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
    <div className="flex-1 space-y-2 p-2 md:p-4 pt-3">
      <div className="flex justify-end ">
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
