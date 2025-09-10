"use client"

import { DataTable } from "@/components/shared/data-table"
import { getMachineTableConfig } from "@/components/shared/table-configs/machine-table-config"
import { Machine } from "@/app/lib/types"

interface MachineTableProps {
  machines: Machine[]
  onDeleteMachine: (id: number) => void
  onEditMachine: (machine: Machine) => void
}

export function MachineTable({ machines, onDeleteMachine, onEditMachine }: MachineTableProps) {
  const tableConfig = getMachineTableConfig(machines, onEditMachine, onDeleteMachine)

  return (
    <DataTable
      title="Machines"
      data={machines}
      {...tableConfig}
    />
  )
}
