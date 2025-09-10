"use client"

import { useState } from "react"
import { ExperienceTable } from "@/components/experiences/experience-table"
import { ExperienceDrawer } from "@/components/experiences/experience-drawer"
import { Experience } from "@/app/lib/types"


// Mock data for experiences
const mockExperiences: Experience[] = [
  {
    id: 1,
    machineId: 1,
    gameId: 1,
    domeId: 1,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    machine: {
      id: 1,
      name: "Arcade Cabinet #1",
      machineTypeId: 1,
      domeId: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    game: {
      id: 1,
      name: "Street Fighter",
      price: 2.5,
      playTime: 15,
      gameTypeId: 1,
      machineTypeId: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    dom: {
      id: 1,
      name: "Dom 1",
      address: "123 Main St",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: 2,
    machineId: 2,
    gameId: 2,
    domeId: 1,
    createdAt: "2024-01-15T14:20:00Z",
    updatedAt: "2024-01-15T14:20:00Z",
    machine: {
      id: 2,
      name: "Pinball Machine #1",
      machineTypeId: 2,
      domeId: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    game: {
      id: 2,
      name: "Medieval Madness",
      price: 3.0,
      playTime: 20,
      gameTypeId: 2,
      machineTypeId: 2,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    dom: {
      id: 1,
      name: "Dom 1",
      address: "123 Main St",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: 3,
    machineId: 3,
    gameId: 3,
    domeId: 2,
    createdAt: "2024-01-16T09:15:00Z",
    updatedAt: "2024-01-16T09:15:00Z",
    machine: {
      id: 3,
      name: "Racing Simulator #1",
      machineTypeId: 3,
      domeId: 2,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    game: {
      id: 3,
      name: "Need for Speed",
      price: 4.0,
      playTime: 10,
      gameTypeId: 3,
      machineTypeId: 3,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    dom: {
      id: 2,
      name: "Dom 2",
      address: "456 Oak Ave",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  },
]

export default function ExperiencesPage() {
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleExperienceClick = (experience: Experience) => {
    setSelectedExperience(experience)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedExperience(null)
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Experiences</h2>
        </div>
        <ExperienceTable experiences={mockExperiences} onExperienceClick={handleExperienceClick} />
      </div>

      <ExperienceDrawer experience={selectedExperience} isOpen={isDrawerOpen} onClose={handleCloseDrawer} />
    </div>
  )
}
