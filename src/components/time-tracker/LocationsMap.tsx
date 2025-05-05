
import { useEffect, useState } from "react";
import { SelectedLocationDisplay } from "./map/SelectedLocationDisplay";
import { SimpleMapDisplay } from "./map/SimpleMapDisplay";
import { GeolocationHandler } from "./map/GeolocationHandler";
import { AddressDetails } from "./map/OpenStreetMapUtils";

interface LocationsMapProps {
  onSelectLocation: (location: { 
    address: string; 
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    latitude: number; 
    longitude: number 
  }) => void;
}

export function LocationsMap({ onSelectLocation }: LocationsMapProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<AddressDetails | null>(null);
  
  // Automatically get location when component mounts
  useEffect(() => {
    // This will trigger the GeolocationHandler to start locating automatically
    setIsLocating(true);
  }, []);

  const handleLocationDetected = (locationDetails: AddressDetails) => {
    setSelectedLocation(locationDetails);
    setIsLocating(false);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <GeolocationHandler 
          onLocationDetected={handleLocationDetected} 
        />
      </div>

      <SimpleMapDisplay
        latitude={selectedLocation?.latitude || 0}
        longitude={selectedLocation?.longitude || 0}
        isLocating={isLocating}
      />

      {selectedLocation && (
        <SelectedLocationDisplay
          address={selectedLocation.address}
          street={selectedLocation.street}
          city={selectedLocation.city}
          state={selectedLocation.state}
          zipCode={selectedLocation.zipCode}
          coordinates={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude
          }}
          onConfirm={handleConfirmLocation}
        />
      )}
    </div>
  );
}
