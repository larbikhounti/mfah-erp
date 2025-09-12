"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import {
  useGamesStore,
  type Game,
  type UpdateGamePayload,
} from "@/stores/games-store";
import { useGameTypesStore } from "@/stores/game-types-store";
import { useMachineTypesStore } from "@/stores/machine-types-store";
import { toast } from "sonner";

interface EditGameDialogProps {
  game: Game;
  trigger?: React.ReactNode;
}

export function EditGameDialog({ game, trigger }: EditGameDialogProps) {
  const { updateGame, loading } = useGamesStore();
  const {
    gameTypes,
    fetchGameTypes,
    loading: gameTypesLoading,
  } = useGameTypesStore();
  const {
    machineTypes,
    fetchMachineTypes,
    loading: machineTypesLoading,
  } = useMachineTypesStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateGamePayload>({
    name: game.name,
    price: game.price,
    playTime: game.playTime,
    age: game.age || undefined,
    gameTypeId: game.gameTypeId || undefined,
    machineTypeId: game.machineTypeId || undefined,
  });

  // Update form data when game prop changes
  useEffect(() => {
    setFormData({
      name: game.name,
      price: game.price,
      playTime: game.playTime,
      age: game.age || undefined,
      gameTypeId: game.gameTypeId || undefined,
      machineTypeId: game.machineTypeId || undefined,
    });
  }, [game]);

  // Fetch game types and machine types when dialog opens
  useEffect(() => {
    if (open) {
      fetchGameTypes();
      fetchMachineTypes();
    }
  }, [open, fetchGameTypes, fetchMachineTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name?.trim()) {
      toast.error("Game name is required");
      return;
    }

    if (formData.price !== undefined && formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (formData.playTime !== undefined && formData.playTime <= 0) {
      toast.error("Play time must be greater than 0");
      return;
    }

    try {
      await updateGame(game.id, formData);
      toast.success("Game updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update game");
    }
  };

  const handleInputChange = (
    field: keyof UpdateGamePayload,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter game name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter price"
              value={formData.price || ""}
              onChange={(e) =>
                handleInputChange(
                  "price",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="playTime">Play Time (minutes)</Label>
            <Input
              id="playTime"
              type="number"
              min="1"
              placeholder="Enter play time in minutes"
              value={formData.playTime || ""}
              onChange={(e) =>
                handleInputChange(
                  "playTime",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age Requirement</Label>
            <Input
              id="age"
              type="number"
              min="0"
              placeholder="Enter minimum age (optional)"
              value={formData.age || ""}
              onChange={(e) =>
                handleInputChange(
                  "age",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            />
          </div>

          <div className="w-full grid md:grid-cols-2 gap-4">
            <div className="grid gap-2 w-full">
              <Label htmlFor="gameType">Game Type</Label>
              <Select
                value={formData.gameTypeId?.toString() || "none"}
                onValueChange={(value) =>
                  handleInputChange(
                    "gameTypeId",
                    value === "none" ? undefined : parseInt(value)
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No game type</SelectItem>
                  {gameTypesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    gameTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 w-full">
              <Label htmlFor="machineType">Machine Type</Label>
              <Select
                value={formData.machineTypeId?.toString() || "none"}
                onValueChange={(value) =>
                  handleInputChange(
                    "machineTypeId",
                    value === "none" ? undefined : parseInt(value)
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select machine type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No machine type</SelectItem>
                  {machineTypesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    machineTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Game"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
