
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseGoogleMapsProps {
  apiKey?: string;
  onMapLoad?: () => void;
}

interface SelectedLocation {
  address: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
}

export function useGoogleMaps({ onMapLoad }: UseGoogleMapsProps) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [serviceLoaded, setServiceLoaded] = useState(false);

  // Auto-load the map service on mount
  useEffect(() => {
    loadGoogleMapsApi();
  }, []);

  const loadGoogleMapsApi = () => {
    // We're using OpenStreetMap now, so just set loaded to true
    setServiceLoaded(true);
    
    // Call the onMapLoad callback if provided
    if (onMapLoad) {
      onMapLoad();
    }
    
    // Get current location automatically
    handleGetCurrentLocation();
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
          // Use OpenStreetMap reverse geocoding service
          const addressDetails = await fetchAddressFromCoordinates(pos.lat, pos.lng);
          
          setSelectedLocation({
            ...addressDetails,
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
