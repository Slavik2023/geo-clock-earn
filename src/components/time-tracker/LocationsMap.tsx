
import { useEffect, useState, useRef } from "react";
import { SelectedLocationDisplay } from "./map/SelectedLocationDisplay";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Locate } from "lucide-react";

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
  const [selectedLocation, setSelectedLocation] = useState<{ 
    address: string; 
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    latitude: number; 
    longitude: number 
  } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Automatically get location when component mounts
  useEffect(() => {
    handleGetCurrentLocation();
  }, []);
  
  // Function to initialize the map
  const initFreeMap = () => {
    if (mapContainerRef.current) {
      // Create a basic map representation
      const mapContainer = mapContainerRef.current;
      mapContainer.innerHTML = "";
      
      const mapPlaceholder = document.createElement("div");
      mapPlaceholder.className = "flex items-center justify-center h-full text-center text-muted-foreground";
      mapPlaceholder.innerHTML = `
        <div>
          <p>OpenStreetMap Location Service</p>
          <p class="text-sm mt-2">Detecting your location...</p>
        </div>
      `;
      
      mapContainer.appendChild(mapPlaceholder);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    initFreeMap();
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        try {
          // Use OpenStreetMap's Nominatim API for reverse geocoding
          const addressDetails = await fetchAddressFromCoordinates(pos.lat, pos.lng);
          
          setSelectedLocation({
            ...addressDetails,
            latitude: pos.lat,
            longitude: pos.lng,
          });
          
          // Update the map visualization
          updateMapMarker(pos.lat, pos.lng);
        } catch (error) {
          console.error("Error getting address:", error);
          
          // Fallback to coordinates as address
          const fallbackAddress = `Lat: ${pos.lat.toFixed(6)}, Lng: ${pos.lng.toFixed(6)}`;
          
          setSelectedLocation({
            address: fallbackAddress,
            latitude: pos.lat,
            longitude: pos.lng,
          });
          
          updateMapMarker(pos.lat, pos.lng);
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
  
  const updateMapMarker = (lat: number, lng: number) => {
    if (mapContainerRef.current) {
      const mapContainer = mapContainerRef.current;
      mapContainer.innerHTML = "";
      
      const mapElement = document.createElement("div");
      mapElement.className = "relative w-full h-full bg-blue-50";
      
      const markerElement = document.createElement("div");
      markerElement.className = "absolute w-6 h-6 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 border-2 border-white";
      markerElement.innerHTML = '<div class="w-2 h-2 bg-white rounded-full m-auto mt-1.5"></div>';
      
      const coordsElement = document.createElement("div");
      coordsElement.className = "absolute bottom-2 right-2 bg-white px-2 py-1 text-xs rounded-md shadow-sm";
      coordsElement.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      mapElement.appendChild(markerElement);
      mapElement.appendChild(coordsElement);
      mapContainer.appendChild(mapElement);
    }
  };
  
  // Function to get address from coordinates using OpenStreetMap
  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // OpenStreetMap's Nominatim API
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TimeTracker App' // Required by OSM Nominatim usage policy
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Extract relevant address details
      const address = data.display_name || '';
      const street = data.address?.road || data.address?.street || '';
      const houseNumber = data.address?.house_number || '';
      const city = data.address?.city || data.address?.town || data.address?.village || '';
      const state = data.address?.state || '';
      const zipCode = data.address?.postcode || '';
      
      // Construct street address
      const streetAddress = houseNumber ? `${houseNumber} ${street}` : street;
      
      return {
        address,
        street: streetAddress,
        city,
        state,
        zipCode,
        latitude: lat,
        longitude: lng
      };
    } catch (error) {
      console.error("Error fetching address:", error);
      return {
        address: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        latitude: lat,
        longitude: lng
      };
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
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
      </div>

      <div 
        ref={mapContainerRef} 
        className="w-full h-[300px] rounded-md border mb-2 bg-gray-100 overflow-hidden" 
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
