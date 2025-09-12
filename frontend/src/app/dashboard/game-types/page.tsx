"use client";

import { useEffect } from "react";
import { useGameTypesStore, type GameType } from "@/stores/game-types-store";
import { EnhancedGameTypeTable } from "@/components/game-types/enhanced-game-type-table";

export default function GameTypesPage() {
  const { fetchGameTypes } = useGameTypesStore();

  // Fetch game types on component mount
  useEffect(() => {
    fetchGameTypes();
  }, [fetchGameTypes]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Game Types Management</h1>
          <p className="text-muted-foreground">
            Manage your game type categories and classifications
          </p>
        </div>
      </div>

      <EnhancedGameTypeTable />
    </section>
  );
}
