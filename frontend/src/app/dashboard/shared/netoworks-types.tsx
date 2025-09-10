import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface NetworkTypeProps {
  types?: string[];
  onTypeChange: (type: string) => void;
}

export default function NetworkTypes({
  types,
  onTypeChange,
}: NetworkTypeProps) {
  // Add safety check for types array
  if (!types || types.length === 0) {
    return (
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium leading-none text-foreground">
          Network Platform
        </legend>
        <p className="text-sm text-muted-foreground">No platform types available</p>
      </fieldset>
    );
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium leading-none text-foreground">
        Network Platform
      </legend>
      <RadioGroup
        onValueChange={(value) => {
          onTypeChange(value);
        }}
        className="flex flex-wrap gap-2"
      >
        {types.map((item, index) => (
          <div
            key={index}
            className="relative flex flex-col items-start gap-4 rounded-lg border border-input p-3 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id={index.toString()}
                value={item.toLowerCase()}
                className="after:absolute after:inset-0"
              />
              <Label
                htmlFor={item.toLowerCase()}
                className="text-sm font-medium leading-none text-foreground"
              >
                {item.toLowerCase()}
              </Label>
            </div>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
