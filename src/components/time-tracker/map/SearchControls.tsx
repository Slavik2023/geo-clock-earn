
import { Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefObject } from "react";

interface SearchControlsProps {
  searchInputRef: RefObject<HTMLInputElement>;
  isLocating: boolean;
  onGetCurrentLocation: () => void;
}

export function SearchControls({ 
  searchInputRef, 
  isLocating, 
  onGetCurrentLocation 
}: SearchControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          id="pac-input"
          ref={searchInputRef}
          className="w-full p-2 border rounded-md shadow-sm text-sm"
          type="text"
          placeholder="Search for a location"
        />
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onGetCurrentLocation}
        disabled={isLocating}
        className="shrink-0"
      >
        {isLocating ? (
          <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full mr-1" />
        ) : (
          <Locate className="h-4 w-4 mr-1" />
        )}
        {isLocating ? "Locating..." : "My Location"}
      </Button>
    </div>
  );
}
