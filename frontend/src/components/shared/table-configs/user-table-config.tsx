import { DataTableProps } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { IconEdit, IconTrash } from "@tabler/icons-react"

// User table configuration
export interface User {
  id: string
  name: string
  email: string
  role: "backoffice" | "front office"
  dom: "dom1" | "dom2" | "dom3"
}

export const getUserTableConfig = (
  onEditUser: (user: User) => void,
  onDeleteUser: (id: string) => void
): Pick<DataTableProps<User>, 'columns' | 'searchKeys' | 'filters' | 'actions' | 'searchPlaceholder'> => ({
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { 
      key: "role", 
      label: "Role",
      render: (user) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === "backoffice" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
          }`}
        >
          {user.role}
        </span>
      )
    },
    {
      key: "dom",
      label: "Dom", 
      render: (user) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {user.dom}
        </span>
      )
    },
  ],
  searchKeys: ["name", "email"],
  searchPlaceholder: "Search by name or email...",
  filters: [
    {
      key: "role",
      label: "All Roles",
      placeholder: "Filter by role",
      options: [
        { value: "backoffice", label: "Back Office" },
        { value: "front office", label: "Front Office" },
      ],
      getValue: (user: User) => user.role,
    },
    {
      key: "dom",
      label: "All Doms",
      placeholder: "Filter by dom",
      options: [
        { value: "dom1", label: "Dom1" },
        { value: "dom2", label: "Dom2" },
        { value: "dom3", label: "Dom3" },
      ],
      getValue: (user: User) => user.dom,
    },
  ],
  actions: (user) => (
    <>
      <Button variant="ghost" size="sm" onClick={() => onEditUser(user)}>
        <IconEdit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDeleteUser(user.id)}
        className="text-red-600 hover:text-red-700"
      >
        <IconTrash className="h-4 w-4" />
      </Button>
    </>
  ),
})
