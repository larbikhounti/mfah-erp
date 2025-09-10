"use client"

import { DataTable } from "@/components/shared/data-table"
import { Dom, getDomTableConfig } from "@/components/shared/table-configs/dom-table-config"

interface DomTableProps {
  doms: Dom[]
  onEditDom: (dom: Dom) => void
  onDeleteDom: (id: number) => void
}

export function DomTable({ doms, onEditDom, onDeleteDom }: DomTableProps) {
  const tableConfig = getDomTableConfig(doms, onEditDom, onDeleteDom)

  return (
    <DataTable
      title="Doms"
      data={doms}
      {...tableConfig}
    />
  )
}
