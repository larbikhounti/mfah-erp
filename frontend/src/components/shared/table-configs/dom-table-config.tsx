import { DataTableProps } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconEdit, IconTrash } from "@tabler/icons-react"

export interface Dom {
  id: number
  name: string
  address: string
  createdAt: string
  updatedAt: string
}

export const getDomTableConfig = (
  doms: Dom[],
  onEditDom: (dom: Dom) => void,
  onDeleteDom: (id: number) => void
): Pick<DataTableProps<Dom>, 'columns' | 'searchKeys' | 'filters' | 'actions' | 'searchPlaceholder'> => {
  const uniqueAreas = Array.from(new Set(
    doms
      .map((dom) => {
        const firstWord = dom.address.split(" ")[0]
        return firstWord
      })
      .filter(Boolean),
  )).sort()

  return {
    columns: [
      { key: "name", label: "Name" },
      { 
        key: "address", 
        label: "Street Address",
        render: (dom) => <Badge variant="outline">{dom.address}</Badge>
      },
      { 
        key: "createdAt", 
        label: "Created At",
        render: (dom) => new Date(dom.createdAt).toLocaleDateString()
      },
      { 
        key: "updatedAt", 
        label: "Updated At",
        render: (dom) => new Date(dom.updatedAt).toLocaleDateString()
      },
    ],
    searchKeys: ["name", "address"],
    searchPlaceholder: "Search doms...",
    filters: [
      {
        key: "area",
        label: "All Areas",
        placeholder: "Filter by area",
        options: uniqueAreas.map((area) => ({
          value: area,
          label: area,
        })),
        getValue: (dom: Dom) => {
          const firstWord = dom.address.split(" ")[0]
          return firstWord || ""
        },
      },
    ],
    actions: (dom) => (
      <>
        <Button variant="ghost" size="sm" onClick={() => onEditDom(dom)}>
          <IconEdit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDeleteDom(dom.id)}>
          <IconTrash className="h-4 w-4" />
        </Button>
      </>
    ),
  }
}
