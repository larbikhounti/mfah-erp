import { DataTableProps } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { IconEdit, IconTrash } from "@tabler/icons-react"

export interface MachineType {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export const getMachineTypeTableConfig = (
  onEditMachineType: (machineType: MachineType) => void,
  onDeleteMachineType: (id: number) => void
): Pick<DataTableProps<MachineType>, 'columns' | 'searchKeys' | 'actions' | 'searchPlaceholder'> => ({
  columns: [
    { key: "name", label: "Name" },
    { 
      key: "createdAt", 
      label: "Created At",
      render: (machineType) => new Date(machineType.createdAt).toLocaleDateString()
    },
    { 
      key: "updatedAt", 
      label: "Updated At",
      render: (machineType) => new Date(machineType.updatedAt).toLocaleDateString()
    },
  ],
  searchKeys: ["name"],
  searchPlaceholder: "Search machine types...",
  actions: (machineType) => (
    <>
      <Button variant="outline" size="sm" onClick={() => onEditMachineType(machineType)}>
        <IconEdit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => onDeleteMachineType(machineType.id)}>
        <IconTrash className="h-4 w-4" />
      </Button>
    </>
  ),
})
