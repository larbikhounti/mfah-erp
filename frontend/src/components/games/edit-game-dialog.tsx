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
import { axiosInstance } from "@/lib/utils";
import { toast } from "sonner";

interface GameType {
  id: number;
  name: string;
}

interface MachineType {
  id: number;
  name: string;
}

interface EditGameDialogProps {
  game: Game;
  trigger?: React.ReactNode;
}

export function EditGameDialog({ game, trigger }: EditGameDialogProps) {
  const { updateGame, loading } = useGamesStore();
  const [open, setOpen] = useState(false);
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState<UpdateGamePayload>({
    name: game.name,
    price: game.price,
    playTime: game.playTime,
    gameTypeId: game.gameTypeId || undefined,
    machineTypeId: game.machineTypeId || undefined,
  });

  // Update form data when game prop changes
  useEffect(() => {
    setFormData({
      name: game.name,
      price: game.price,
      playTime: game.playTime,
      gameTypeId: game.gameTypeId || undefined,
      machineTypeId: game.machineTypeId || undefined,
    });
  }, [game]);

  // Fetch game types and machine types when dialog opens
  useEffect(() => {
    if (open) {
      fetchGameTypesAndMachineTypes();
    }
  }, [open]);

  const fetchGameTypesAndMachineTypes = async () => {
    setLoadingData(true);
    try {
      // Fetch game types
      const gameTypesResponse = await axiosInstance.get("/game-types");
      if (gameTypesResponse.data.data) {
        setGameTypes(gameTypesResponse.data.data);
      }

      // Fetch machine types
      const machineTypesResponse = await axiosInstance.get("/machine-types");
      if (machineTypesResponse.data.data) {
        setMachineTypes(machineTypesResponse.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch game types and machine types:", error);
      toast.error("Failed to load game types and machine types");
    } finally {
      setLoadingData(false);
    }
  };

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
            <Label htmlFor="gameType">Game Type</Label>
            <Select
              value={formData.gameTypeId?.toString() || ""}
              onValueChange={(value) =>
                handleInputChange(
                  "gameTypeId",
                  value ? parseInt(value) : undefined
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select game type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No game type</SelectItem>
                {loadingData ? (
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

          <div className="space-y-2">
            <Label htmlFor="machineType">Machine Type</Label>
            <Select
              value={formData.machineTypeId?.toString() || ""}
              onValueChange={(value) =>
                handleInputChange(
                  "machineTypeId",
                  value ? parseInt(value) : undefined
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select machine type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No machine type</SelectItem>
                {loadingData ? (
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? "Updating..." : "Update Game"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
