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
import { MoreHorizontal, Trash2, Edit, UserPlus, Users, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUsersStore, type User } from "@/stores/users-store";
import { toast } from "sonner";
import { CreateUserDialog } from "@/components/user/create-user-dialog";
import { EditUserDialog } from "@/components/user/edit-user-dialog";
import { ExportExcelButton } from "@/components/shared/export-excel-button";
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
    showArchived,
    fetchUsers,
    deleteUser,
    bulkDeleteUsers,
    restoreUser,
    bulkRestoreUsers,
    selectUser,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useUsersStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [userToRestore, setUserToRestore] = useState<number | null>(null);

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

  const handleRestoreUser = async (id: number) => {
    try {
      await restoreUser(id);
      toast.success("User restored successfully");
      setRestoreDialogOpen(false);
      setUserToRestore(null);
    } catch (error) {
      toast.error("Failed to restore user");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreUsers(selectedUsers);
      toast.success(`${selectedUsers.length} users restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch (error) {
      toast.error("Failed to restore users");
    }
  };

  const selectedDeletedUsers = users.filter(u => selectedUsers.includes(u.id) && u.deletedAt);
  const selectedActiveUsers = users.filter(u => selectedUsers.includes(u.id) && !u.deletedAt);

  // Define base columns that are always visible
  const baseColumns: TableColumn<User>[] = [
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
      sortable: true,
      render: (user) => <div className="font-mono text-sm">{user.id}</div>,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (user) => <div className="font-medium">{user.name}</div>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (user) => (
        <div className="text-sm text-muted-foreground">{user.email}</div>
      ),
    },
    {
      key: "role",
      label: "Role",
       sortable: true,
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
  ];

  // Created column (shown when NOT in archive mode)
  const createdColumn: TableColumn<User> = {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (user) => {
      const date = new Date(user.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Deleted column (shown when in archive mode)
  const deletedColumn: TableColumn<User> = {
    key: "deletedAt",
    label: "Deleted",
    sortable: true,
    render: (user) => {
      if (!user.deletedAt) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }
      const date = new Date(user.deletedAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Actions column
  const actionsColumn: TableColumn<User> = {
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
          {!user.deletedAt && (
            <>
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
            </>
          )}
          {user.deletedAt && (
            <DropdownMenuItem
              onClick={() => {
                setUserToRestore(user.id);
                setRestoreDialogOpen(true);
              }}
              className="text-green-600"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  // Build the final columns array based on showArchived state
  const columns: TableColumn<User>[] = [
    ...baseColumns,
    ...(showArchived ? [deletedColumn] : [createdColumn]),
    actionsColumn,
  ];

  return (
    <div className="space-y-4">
      <DataTable
        title="User Management"
        data={users}
        columns={columns}
        searchKeys={["name", "email", "role"]}
        searchPlaceholder="Search users by name, email, or role..."
        emptyMessage="No users found"
        showCount={true}
        customHeader={
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-archived"
                checked={showArchived}
                onCheckedChange={setShowArchived}
                className="data-[state=checked]:bg-red-600"
              />
              <Label htmlFor="show-archived" className="text-sm font-medium">
                Archive
              </Label>
            </div>
            <ExportExcelButton<User>
              endpoint="/users/admin/list/all"
              total={total}
              extraParams={{ showArchived }}
              filenamePrefix="users"
              sheetName="Users"
              mapRow={(u) => ({
                Name: u.name,
                Email: u.email,
                Role: u.role,
              })}
              columns={[
                { key: "Name", header: "Name" },
                { key: "Email", header: "Email" },
                { key: "Role", header: "Role" },
              ]}
            />
            {selectedUsers.length > 0 && (
              <>
                {selectedActiveUsers.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveUsers.length})
                  </Button>
                )}
                {selectedDeletedUsers.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedUsers.length})
                  </Button>
                )}
              </>
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
              This will archive the user. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the user and make it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToRestore && handleRestoreUser(userToRestore)}
              className="bg-green-600 hover:bg-green-700"
            >
              Restore
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
              Archive {selectedActiveUsers.length} users?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected users. You can restore them later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Archive All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Restore Dialog */}
      <AlertDialog
        open={bulkRestoreDialogOpen}
        onOpenChange={setBulkRestoreDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Restore {selectedDeletedUsers.length} users?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected users and make them active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkRestore}
              className="bg-green-600 hover:bg-green-700"
            >
              Restore All
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
