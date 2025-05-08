
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
    toast.info("Getting your precise location...");
    
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        console.log("Position obtained with accuracy:", pos.accuracy, "meters");
        
        try {
          // Use OpenStreetMap's Nominatim API for reverse geocoding
          const addressDetails = await fetchAddressFromCoordinates(pos.lat, pos.lng);
          console.log("Address details:", addressDetails);
          
          if (addressDetails) {
            toast.success(`Location determined: ${addressDetails.address}`);
            onLocationDetected(addressDetails);
          }
        } catch (error) {
          console.error("Error getting address:", error);
          
          // Fallback to using coordinates as address
          const fallbackAddress = `Latitude: ${pos.lat.toFixed(6)}, Longitude: ${pos.lng.toFixed(6)}`;
          toast.warning("Couldn't get address, using coordinates");
          
          onLocationDetected({
            address: fallbackAddress,
            latitude: pos.lat,
            longitude: pos.lng
          });
        }
        
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = "Unable to get your location.";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The location request timed out.";
            break;
        }
        
        console.error("Geolocation error:", error.message);
        toast.error(`Error: ${errorMessage}`);
      },
      geoOptions
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
      {isLocating ? "Getting location..." : "Update Location"}
    </Button>
  );
}
