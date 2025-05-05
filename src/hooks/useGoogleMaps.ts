
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseGoogleMapsProps {
  apiKey?: string;
  onMapLoad?: () => void;
}

interface SelectedLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export function useGoogleMaps({ onMapLoad }: UseGoogleMapsProps) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [serviceLoaded, setServiceLoaded] = useState(false);

  const loadGoogleMapsApi = () => {
    // We're now using a free service, so just set loaded to true
    setServiceLoaded(true);
    
    // Call the onMapLoad callback if provided
    if (onMapLoad) {
      onMapLoad();
    }
  };

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
          // Use a free reverse geocoding service or simple formatting
          const address = `Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`;
          
          setSelectedLocation({
            address,
            latitude: pos.lat,
            longitude: pos.lng,
          });
          
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
    if (mapRef.current) {
      const mapContainer = mapRef.current;
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

  return {
    selectedLocation,
    isLocating,
    mapRef,
    searchInputRef,
    loadGoogleMapsApi,
    handleGetCurrentLocation,
    setSelectedLocation,
    googleMapsLoaded: serviceLoaded
  };
}
