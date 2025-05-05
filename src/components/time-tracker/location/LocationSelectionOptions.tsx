
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LocationsManager } from "../LocationsManager";
import { LocationsMap } from "../LocationsMap";
import { SavedLocationsList } from "./SavedLocationsList";
import { MapLocationSelection } from "../types/LocationTypes";

interface LocationSelectionOptionsProps {
  savedLocations: any[];
  onLocationSelected: (location: any) => void;
  onManualEntryClick: () => void;
  isMapOpen: boolean;
  setIsMapOpen: (isOpen: boolean) => void;
  onMapLocationSelected: (location: MapLocationSelection) => void;
}

export function LocationSelectionOptions({ 
  savedLocations, 
  onLocationSelected, 
  onManualEntryClick,
  isMapOpen, 
  setIsMapOpen,
  onMapLocationSelected
}: LocationSelectionOptionsProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <Sheet open={isMapOpen} onOpenChange={setIsMapOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white"
          >
            <Map className="h-3 w-3 mr-1" />
            Select on Map
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Select Your Location</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <LocationsMap onSelectLocation={onMapLocationSelected} />
          </div>
        </SheetContent>
      </Sheet>
      
      <SavedLocationsList 
        locations={savedLocations} 
        onLocationSelected={onLocationSelected}
      />
      
      <div className="w-full mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onManualEntryClick}
        >
          Enter Address Manually
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
            >
              <Map className="h-4 w-4 mr-2" />
              Manage Locations
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Locations</DialogTitle>
            </DialogHeader>
            <LocationsManager />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
