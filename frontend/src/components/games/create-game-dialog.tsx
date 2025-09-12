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
import { Plus } from "lucide-react";
import { useGamesStore, type CreateGamePayload } from "@/stores/games-store";
import { useGameTypesStore } from "@/stores/game-types-store";
import { useMachineTypesStore } from "@/stores/machine-types-store";
import { toast } from "sonner";

interface CreateGameDialogProps {
  trigger?: React.ReactNode;
}

export function CreateGameDialog({ trigger }: CreateGameDialogProps) {
  const { createGame, loading } = useGamesStore();
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
  const [formData, setFormData] = useState<CreateGamePayload>({
    name: "",
    price: 0,
    playTime: 0,
    gameTypeId: undefined,
    machineTypeId: undefined,
  });

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
    if (!formData.name.trim()) {
      toast.error("Game name is required");
      return;
    }

    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (formData.playTime <= 0) {
      toast.error("Play time must be greater than 0");
      return;
    }

    try {
      await createGame(formData);
      toast.success("Game created successfully");
      setOpen(false);
      // Reset form
      setFormData({
        name: "",
        price: 0,
        playTime: 0,
        gameTypeId: undefined,
        machineTypeId: undefined,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create game");
    }
  };

  const handleInputChange = (
    field: keyof CreateGamePayload,
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
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Game
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Game</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter game name"
              value={formData.name}
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
                  e.target.value ? parseFloat(e.target.value) : 0
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
                  e.target.value ? parseInt(e.target.value) : 0
                )
              }
              required
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

          <div className="flex justify-end space-x-2 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || gameTypesLoading || machineTypesLoading}
            >
              {loading ? "Creating..." : "Create Game"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
