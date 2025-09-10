"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Platform = {
  id: number;
  name: string;
  type: string;
  website: string;
};

interface SelectNetworkProps {
  onPlatformSelect?: (platformId: number) => void;
  platforms?: Platform[];
}

export default function SelectNetwork({ 
  platforms = [], 
  onPlatformSelect 
}: SelectNetworkProps) {
  console.log("SelectNetwork rendered with platforms:", platforms);

  const handleValueChange = (value: string) => {
    const platformId = parseInt(value);
    if (onPlatformSelect) {
      onPlatformSelect(platformId);
    }
  };

  if (platforms.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Select Network</Label>
        <p className="text-sm text-muted-foreground">No platforms available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>Select Network</Label>
      <RadioGroup onValueChange={handleValueChange} className="grid gap-2">
        {platforms.map((platform) => (
          <div key={platform.id} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={platform.id.toString()} 
              id={`platform-${platform.id}`}
            />
            <Label 
              htmlFor={`platform-${platform.id}`}
              className="text-sm font-normal cursor-pointer flex-1"
            >
              {platform.name}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}