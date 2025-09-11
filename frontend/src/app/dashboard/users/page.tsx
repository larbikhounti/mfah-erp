"use client"

import { CreateUser, User } from "@/app/lib/types"
import { CreateUserDialog } from "@/components/user/create-user-dialog"
import { EditUserDialog } from "@/components/user/edit-user-dialog"
import {  UserTable } from "@/components/user/user-table"
import { axiosInstance } from "@/lib/utils"
import { useState } from "react"

import useSWR from 'swr';

export default function UsersPage() {
  const { data : users, mutate } = useSWR<User[]>("/api", async()=>{
    return  axiosInstance.get("/users/all").then(res => res.data.data)
  })
  console.log(users)

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleCreateUser = (userData: CreateUser) => {
    const newUser: CreateUser = {
      ...userData,
    }
    //TODO : should mutate sung swr
  }

  const handleDeleteUser = (id: number) => {
   // setUsers(data.filter((user) => user.id !== id))
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = (updatedUser: User) => {
    // setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
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
      <UserTable users={users || []} onDeleteUser={handleDeleteUser} onEditUser={handleEditUser} />

      <EditUserDialog
        user={editingUser}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onEditUser={handleUpdateUser}
      />
    </div>
  )
}
