"use client"

import { Experience } from "@/app/lib/types"
import { DataTable } from "@/components/shared/data-table"
import { getExperienceTableConfig } from "@/components/shared/table-configs/experience-table-config"

interface ExperienceTableProps {
  experiences: Experience[]
  onExperienceClick: (experience: Experience) => void
}

export function ExperienceTable({ experiences, onExperienceClick }: ExperienceTableProps) {
  const tableConfig = getExperienceTableConfig(experiences, onExperienceClick)

  return (
    <DataTable
      title="Experiences"
      data={experiences}
      {...tableConfig}
    />
  )
}
