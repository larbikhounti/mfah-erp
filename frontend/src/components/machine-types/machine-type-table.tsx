"use client"

import { DataTable } from "@/components/shared/data-table"
import { MachineType, getMachineTypeTableConfig } from "@/components/shared/table-configs/machine-type-table-config"
import { CreateMachineTypeDialog } from "./create-machine-type-dialog"

interface MachineTypeTableProps {
  machineTypes: MachineType[]
  onCreateMachineType: (machineTypeData: { name: string }) => void
  onEditMachineType: (machineType: MachineType) => void
  onDeleteMachineType: (id: number) => void
}

export function MachineTypeTable({
  machineTypes,
  onEditMachineType,
  onDeleteMachineType,
}: Omit<MachineTypeTableProps, "onCreateMachineType">) {
  const tableConfig = getMachineTypeTableConfig(onEditMachineType, onDeleteMachineType)

  return (
    <DataTable
      title="Machine Types"
      data={machineTypes}
      {...tableConfig}
    />
  )
}
