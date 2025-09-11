"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUsersStore,
  type User,
  type UpdateUserPayload,
} from "@/stores/users-store";
import { toast } from "sonner";

interface EditUserFormProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserForm({ user, open, onOpenChange }: EditUserFormProps) {
  const { updateUser, loading } = useUsersStore();
  const [formData, setFormData] = useState<UpdateUserPayload>({
    name: "",
    email: "",
    password: "",
    role_id: undefined,
    dom_id: undefined,
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Don't populate password for security
        role_id: undefined, // We'll need to map role name to ID
        dom_id: undefined, // We'll need to map DOM name to ID
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Only send fields that have values
      const updateData: UpdateUserPayload = {};
      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.email !== user.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;
      if (formData.role_id) updateData.role_id = formData.role_id;
      if (formData.dom_id) updateData.dom_id = formData.dom_id;

      await updateUser(user.id, updateData);
      toast.success("User updated successfully");
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the store
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter user name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-password">Password</Label>
            <Input
              id="edit-password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Leave empty to keep current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              value={formData.role_id?.toString() || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  role_id: value ? parseInt(value) : undefined,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={`Current: ${user.role || "No Role"}`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Admin</SelectItem>
                <SelectItem value="2">User</SelectItem>
                <SelectItem value="3">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-dom">DOM</Label>
            <Select
              value={formData.dom_id?.toString() || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  dom_id: value ? parseInt(value) : undefined,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={`Current: ${user.dom || "No DOM"}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">VR Experience Center</SelectItem>
                <SelectItem value="2">Gaming Hub</SelectItem>
                <SelectItem value="3">Entertainment Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
