import { DataTableProps } from "@/components/shared/data-table"

export interface Experience {
  id: number
  machineId: number
  domeId: number
  createdAt: string
  machine?: {
    id: number
    name: string
  }
  game?: {
    id: number
    name: string
    price?: number
    playTime?: number
  }
  dom?: {
    id: number
    name: string
  }
}

import { Experience } from "@/app/lib/types"
import { DataTableProps } from "@/components/shared/data-table"

export const getExperienceTableConfig = (
  experiences: Experience[],
  onExperienceClick: (experience: Experience) => void,
): Pick<DataTableProps<Experience>, "columns" | "searchKeys" | "filters" | "onRowClick" | "searchPlaceholder"> => {
  const uniqueMachines = Array.from(new Set(experiences.map((exp) => exp.machine?.name).filter(Boolean)))
  const uniqueGames = Array.from(new Set(experiences.map((exp) => exp.game?.name).filter(Boolean)))
  const uniqueDoms = Array.from(new Set(experiences.map((exp) => exp.dom?.name).filter(Boolean)))

  return {
    columns: [
      {
        key: "machine.name",
        label: "Machine",
        render: (experience) => experience.machine?.name || "N/A",
      },
      {
        key: "game.name",
        label: "Game",
        render: (experience) => experience.game?.name || "N/A",
      },
      {
        key: "dom.name",
        label: "Dom",
        render: (experience) => experience.dom?.name || "N/A",
      },
      {
        key: "createdAt",
        label: "Date",
        render: (experience) => new Date(experience.createdAt).toLocaleString(),
      },
    ],
    searchKeys: ["machine.name", "game.name", "dom.name"],
    searchPlaceholder: "Search experiences...",
    filters: [
      {
        key: "machine",
        label: "All Machines",
        placeholder: "Filter by machine",
        options: uniqueMachines.map((machine) => ({ value: machine, label: machine })),
        getValue: (experience) => experience.machine?.name || "",
      },
      {
        key: "game",
        label: "All Games",
        placeholder: "Filter by game",
        options: uniqueGames.map((game) => ({ value: game, label: game })),
        getValue: (experience) => experience.game?.name || "",
      },
      {
        key: "dom",
        label: "All Doms",
        placeholder: "Filter by dom",
        options: uniqueDoms.map((dom) => ({ value: dom, label: dom })),
        getValue: (experience) => experience.dom?.name || "",
      },
    ],
    onRowClick: onExperienceClick,
  }
}
