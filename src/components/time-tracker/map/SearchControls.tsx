
import { Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefObject } from "react";

interface SearchControlsProps {
  searchInputRef: RefObject<HTMLInputElement>;
  isLocating: boolean;
  onGetCurrentLocation: () => void;
}

export function SearchControls({ 
  isLocating, 
  onGetCurrentLocation 
}: SearchControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onGetCurrentLocation}
        disabled={isLocating}
        className="w-full"
      >
        {isLocating ? (
          <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full mr-1" />
        ) : (
          <Locate className="h-4 w-4 mr-1" />
        )}
        {isLocating ? "Locating..." : "Get My Location"}
      </Button>
    </div>
  );
}
