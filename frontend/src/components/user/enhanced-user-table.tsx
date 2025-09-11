"use client";

import { useState, useEffect } from "react";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Trash2, Edit, UserPlus, Users } from "lucide-react";
import { useUsersStore, type User } from "@/stores/users-store";
import { toast } from "sonner";
import { CreateUserDialog } from "@/components/user/create-user-dialog";
import { EditUserDialog } from "@/components/user/edit-user-dialog";
import PaginationTable from "@/components/pagination-table";

interface EnhancedUserTableProps {
  // Remove the callback props since we'll handle them internally
}

export function EnhancedUserTable({}: EnhancedUserTableProps) {
  const {
    users,
    loading,
    error,
    selectedUsers,
    total,
    currentPage,
    pageSize,
    totalPages,
    fetchUsers,
    deleteUser,
    bulkDeleteUsers,
    selectUser,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
  } = useUsersStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteUsers(selectedUsers);
      toast.success(`${selectedUsers.length} users deleted successfully`);
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete users");
    }
  };

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

  const columns: TableColumn<User>[] = [
    {
      key: "select",
      label: "Select",
      render: (user) => (
        <Checkbox
          checked={selectedUsers.includes(user.id)}
          onCheckedChange={() => selectUser(user.id)}
          aria-label="Select user"
        />
      ),
    },
    {
      key: "id",
      label: "ID",
      render: (user) => <div className="font-mono text-sm">{user.id}</div>,
    },
    {
      key: "name",
      label: "Name",
      render: (user) => <div className="font-medium">{user.name}</div>,
    },
    {
      key: "email",
      label: "Email",
      render: (user) => (
        <div className="text-sm text-muted-foreground">{user.email}</div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (user) => (
        <Badge
          variant={
            user.role?.toLowerCase() === "admin" ? "destructive" : "secondary"
          }
        >
          {user.role || "No Role"}
        </Badge>
      ),
    },
    {
      key: "dom",
      label: "DOM",
      render: (user) => <div className="text-sm">{user.dom || "No DOM"}</div>,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (user) => {
        const date = new Date(user.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild> 
              <EditUserDialog user={user} />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setUserToDelete(user.id);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        title="User Management"
        data={users}
        columns={columns}
        searchKeys={["name", "email", "role", "dom"]}
        searchPlaceholder="Search users by name, email, role, or DOM..."
        emptyMessage="No users found"
        showCount={true}
        customHeader={
          <div className="flex items-center gap-2">
            {selectedUsers.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedUsers.length})
              </Button>
            )}
            <CreateUserDialog />
          </div>
        }
      />
      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedUsers.length} users?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pagination */}
      {total > 0 && (
        <PaginationTable
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
