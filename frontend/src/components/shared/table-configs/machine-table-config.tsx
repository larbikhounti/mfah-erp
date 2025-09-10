import { Machine } from "@/app/lib/types";
import { DataTableProps } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";

export const getMachineTableConfig = (
  machines: Machine[],
  onEditMachine: (machine: Machine) => void,
  onDeleteMachine: (id: number) => void
): Pick<DataTableProps<Machine>, 'columns' | 'searchKeys' | 'filters' | 'actions' | 'searchPlaceholder'> => {
  const uniqueTypes = Array.from(new Set(machines.map((m) => m.machineType?.name).filter(Boolean)))
  const uniqueDoms = Array.from(new Set(machines.map((m) => m.dom?.name).filter(Boolean)))

  return {
    columns: [
      { key: "name", label: "Name" },
      { 
        key: "machineType.name", 
        label: "Machine Type",
        render: (machine) => machine.machineType?.name || "Not assigned"
      },
      { 
        key: "dom.name", 
        label: "Dom",
        render: (machine) => machine.dom?.name || "Not assigned"
      },
      { 
        key: "createdAt", 
        label: "Created At",
        render: (machine) => new Date(machine.createdAt).toLocaleDateString()
      },
    ],
    searchKeys: ["name"],
    searchPlaceholder: "Search machines...",
    filters: [
      {
        key: "machineType",
        label: "All Types",
        placeholder: "Filter by type",
        options: uniqueTypes.map((type) => ({
          value: type!,
          label: type!,
        })),
        getValue: (machine: Machine) => machine.machineType?.name || "",
      },
      {
        key: "dom",
        label: "All Doms",
        placeholder: "Filter by dom",
        options: uniqueDoms.map((dom) => ({
          value: dom!,
          label: dom!,
        })),
        getValue: (machine: Machine) => machine.dom?.name || "",
      },
    ],
    actions: (machine) => (
      <>
        <Button variant="outline" size="sm" onClick={() => onEditMachine(machine)}>
          <IconEdit className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDeleteMachine(machine.id)}>
          <IconTrash className="h-4 w-4" />
        </Button>
      </>
    ),
  }
}
