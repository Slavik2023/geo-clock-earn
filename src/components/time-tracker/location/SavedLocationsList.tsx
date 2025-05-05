
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SavedLocationsListProps {
  locations: any[];
  onLocationSelected: (location: any) => void;
}

export function SavedLocationsList({ locations, onLocationSelected }: SavedLocationsListProps) {
  if (locations.length === 0) {
    return <p className="text-xs mt-1">No saved locations.</p>;
  }

  return (
    <>
      <div className="w-full mt-1 mb-1">
        <p className="text-xs font-medium">Saved locations:</p>
      </div>
      {locations.slice(0, 3).map((location) => (
        <Button 
          key={location.id} 
          variant="outline" 
          size="sm" 
          className="text-xs bg-white"
          onClick={() => onLocationSelected(location)}
        >
          <MapPin className="h-3 w-3 mr-1" />
          {location.name}
        </Button>
      ))}
      
      {locations.length > 3 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs bg-white">
              +{locations.length - 3} more
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose a Location</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {locations.map((location) => (
                <Button 
                  key={location.id} 
                  variant="outline" 
                  onClick={() => {
                    onLocationSelected(location);
                    const closeButton = document.querySelector('[data-radix-dialog-close]');
                    if (closeButton instanceof HTMLElement) {
                      closeButton.click();
                    }
                  }}
                  className="justify-start"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{location.name}</div>
                    <div className="text-xs text-muted-foreground">{location.address}</div>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
