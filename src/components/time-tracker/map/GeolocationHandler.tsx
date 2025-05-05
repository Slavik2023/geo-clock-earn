
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Locate } from "lucide-react";
import { toast } from "sonner";
import { fetchAddressFromCoordinates, AddressDetails } from "./OpenStreetMapUtils";

interface GeolocationHandlerProps {
  onLocationDetected: (locationDetails: AddressDetails) => void;
}

export function GeolocationHandler({ onLocationDetected }: GeolocationHandlerProps) {
  const [isLocating, setIsLocating] = useState(false);
  
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        try {
          // Use OpenStreetMap's Nominatim API for reverse geocoding
          const addressDetails = await fetchAddressFromCoordinates(pos.lat, pos.lng);
          onLocationDetected(addressDetails);
        } catch (error) {
          console.error("Error getting address:", error);
          
          // Fallback to coordinates as address
          const fallbackAddress = `Lat: ${pos.lat.toFixed(6)}, Lng: ${pos.lng.toFixed(6)}`;
          
          onLocationDetected({
            address: fallbackAddress,
            latitude: pos.lat,
            longitude: pos.lng,
          });
        }
        
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = "Unable to retrieve your location.";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get your location timed out.";
            break;
        }
        
        toast.error(`Error: ${errorMessage}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <Button 
      variant="outline"
      size="sm" 
      onClick={handleGetCurrentLocation}
      disabled={isLocating}
      className="w-full"
    >
      {isLocating ? (
        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full mr-2" />
      ) : (
        <Locate className="h-4 w-4 mr-2" />
      )}
      {isLocating ? "Getting your location..." : "Refresh Location"}
    </Button>
  );
}
