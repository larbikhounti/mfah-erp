import { DataTableProps } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { IconEdit, IconTrash } from "@tabler/icons-react"

export interface BasicEntity {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export const getBasicTableConfig = (
  onEdit: (item: BasicEntity) => void,
  onDelete: (id: number) => void,
  searchPlaceholder: string = "Search..."
): Pick<DataTableProps<BasicEntity>, 'columns' | 'searchKeys' | 'actions' | 'searchPlaceholder'> => ({
  columns: [
    { key: "name", label: "Name" },
    { 
      key: "createdAt", 
      label: "Created At",
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    },
    { 
      key: "updatedAt", 
      label: "Updated At",
      render: (item) => new Date(item.updatedAt).toLocaleDateString()
    },
  ],
  searchKeys: ["name"],
  searchPlaceholder,
  actions: (item) => (
    <>
      <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
        <IconEdit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => onDelete(item.id)}>
        <IconTrash className="h-4 w-4" />
      </Button>
    </>
  ),
})
