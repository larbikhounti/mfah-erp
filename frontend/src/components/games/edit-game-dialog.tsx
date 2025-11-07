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
import { Checkbox } from "@/components/ui/checkbox";

// Helper component for time input
interface TimeInputProps {
  id: string;
  label: string;
  totalSeconds: number;
  onChange: (totalSeconds: number) => void;
  required?: boolean;
}

function TimeInput({ id, label, totalSeconds, onChange, required }: TimeInputProps) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const handleMinutesChange = (newMinutes: number) => {
    const newTotal = newMinutes * 60 + seconds;
    onChange(newTotal);
  };

  const handleSecondsChange = (newSeconds: number) => {
    const newTotal = minutes * 60 + newSeconds;
    onChange(newTotal);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Input
            id={`${id}-minutes`}
            type="number"
            min="0"
            placeholder="Minutes"
            value={minutes || ""}
            onChange={(e) =>
              handleMinutesChange(e.target.value ? parseInt(e.target.value) : 0)
            }
            required={required}
          />
          <Label htmlFor={`${id}-minutes`} className="text-xs text-muted-foreground">
            minutes
          </Label>
        </div>
        <span className="text-muted-foreground">:</span>
        <div className="flex-1">
          <Input
            id={`${id}-seconds`}
            type="number"
            min="0"
            max="59"
            placeholder="Seconds"
            value={seconds || ""}
            onChange={(e) =>
              handleSecondsChange(e.target.value ? parseInt(e.target.value) : 0)
            }
          />
          <Label htmlFor={`${id}-seconds`} className="text-xs text-muted-foreground">
            seconds
          </Label>
        </div>
      </div>
    </div>
  );
}
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
import { useDomsStore } from "@/stores/doms-store";
import { toast } from "sonner";
import { Loader } from "../loader";
import { MultiSelect, type Option } from "@/components/ui/multi-select";

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
  const {
    doms,
    fetchDoms,
    loading: domsLoading,
  } = useDomsStore();
  const [open, setOpen] = useState(false);
  const [selectedDomes, setSelectedDomes] = useState<Option[]>(
    game.domes?.map((dome) => ({
      label: dome.name,
      value: dome.id.toString(),
    })) || []
  );
  const [selectedMachineTypes, setSelectedMachineTypes] = useState<Option[]>(
    game.machineTypes?.map((machineType) => ({
      label: machineType.name,
      value: machineType.id.toString(),
    })) || []
  );
  const [formData, setFormData] = useState<UpdateGamePayload>({
    name: game.name,
    price: game.price,
    playTime: game.playTime,
    age: game.age || undefined,
    isFavored: game.isFavored || false,
    gameTypeId: game.gameTypeId || undefined,
    machineTypeIds: game.machineTypes?.map((mt) => mt.id) || [],
    domeId: game.domes?.map((dome) => dome.id) || [],
  });

  // Update form data when game prop changes
  useEffect(() => {
    setFormData({
      name: game.name,
      price: game.price,
      playTime: game.playTime,
      age: game.age || undefined,
      isFavored: game.isFavored || false,
      gameTypeId: game.gameTypeId || undefined,
      machineTypeIds: game.machineTypes?.map((mt) => mt.id) || [],
      domeId: game.domes?.map((dome) => dome.id) || [],
    });
    setSelectedDomes(
      game.domes?.map((dome) => ({
        label: dome.name,
        value: dome.id.toString(),
      })) || []
    );
    setSelectedMachineTypes(
      game.machineTypes?.map((machineType) => ({
        label: machineType.name,
        value: machineType.id.toString(),
      })) || []
    );
  }, [game]);

  // Fetch game types, machine types, and domes when dialog opens
  useEffect(() => {
    if (open) {
      fetchGameTypes();
      fetchMachineTypes();
      fetchDoms();
    }
  }, [open, fetchGameTypes, fetchMachineTypes, fetchDoms]);

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
      toast.error("Play time must be greater than 0 seconds");
      return;
    }

    if (selectedDomes.length === 0) {
      toast.error("Please select at least one dome");
      return;
    }

    try {
      await updateGame(game.id, {
        ...formData,
        machineTypeIds: selectedMachineTypes.map((machineType) => parseInt(machineType.value)),
        domeId: selectedDomes.map((dome) => parseInt(dome.value)),
      });
      toast.success("Game updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update game");
    }
  };

  const handleInputChange = (
    field: keyof UpdateGamePayload,
    value: string | number | boolean | undefined
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

          <TimeInput
            id="playTime"
            label="Play Time"
            totalSeconds={formData.playTime || 0}
            onChange={(totalSeconds) => handleInputChange("playTime", totalSeconds)}
            required
          />

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

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFavored"
                checked={formData.isFavored || false}
                onCheckedChange={(checked) =>
                  handleInputChange("isFavored", checked === true)
                }
              />
              <Label htmlFor="isFavored">Mark as Favorite</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domes">Domes *</Label>
            <MultiSelect
              options={doms.map((dom) => ({
                label: dom.name,
                value: dom.id.toString(),
              }))}
              selected={selectedDomes}
              onChange={setSelectedDomes}
              placeholder={domsLoading ? "Loading domes..." : "Select domes"}
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
              <Label htmlFor="machineTypes">Machine Types</Label>
              <MultiSelect
                options={machineTypes.map((type) => ({
                  label: type.name,
                  value: type.id.toString(),
                }))}
                selected={selectedMachineTypes}
                onChange={setSelectedMachineTypes}
                placeholder="Select machine types"
              />
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
            <Button type="submit" disabled={loading || gameTypesLoading || machineTypesLoading || domsLoading}>
              {loading ?   <span className="flex items-center">
                               <Loader size={16} />
                                <span className="ml-2">
                                  Updating...
                                </span>
                            </span>: "Update Game"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
