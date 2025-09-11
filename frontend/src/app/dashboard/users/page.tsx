"use client";

import { useState, useEffect } from "react";
import { CreateUserDialog } from "@/components/user/create-user-dialog";
import { EditUserDialog } from "@/components/user/edit-user-dialog";
import { useUsersStore, type User } from "@/stores/users-store";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { EnhancedUserTable } from "@/components/user/enhanced-user-table";

export default function UsersPage() {
  const { fetchUsers } = useUsersStore();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingUser(null);
    setIsEditDialogOpen(false);
  };

  const handleCreateUser = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Users Management</h1>
          <p className="text-muted-foreground">
            Manage your application users and their roles
          </p>
        </div>
      </div>

      <EnhancedUserTable />
    </section>
  );
}
