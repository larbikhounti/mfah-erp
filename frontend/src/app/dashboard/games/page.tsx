"use client";

import { useEffect } from "react";
import { useGamesStore, type Game } from "@/stores/games-store";
import { EnhancedGameTable } from "@/components/games/enhanced-game-table";

export default function GamesPage() {
  const { fetchGames } = useGamesStore();

  // Fetch games on component mount
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Games Management</h1>
          <p className="text-muted-foreground">
            Manage your game library and game configurations
          </p>
        </div>
      </div>

      <EnhancedGameTable />
    </section>
  );
}
