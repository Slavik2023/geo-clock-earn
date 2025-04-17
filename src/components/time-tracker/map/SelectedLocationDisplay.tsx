
import { MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectedLocationDisplayProps {
  address: string;
  onConfirm: () => void;
}

export function SelectedLocationDisplay({ address, onConfirm }: SelectedLocationDisplayProps) {
  return (
    <div className="p-3 border rounded-md bg-blue-50">
      <div className="flex items-start gap-2">
        <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Selected Location</p>
          <p className="text-xs text-gray-600">{address}</p>
        </div>
        <Button onClick={onConfirm} variant="outline" size="sm" className="h-8">
          <Check className="h-3 w-3 mr-1" />
          Use This
        </Button>
      </div>
    </div>
  );
}
