
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LocationDetails, MapLocationSelection } from "@/components/time-tracker/types/LocationTypes";

export function useLocationCheck() {
  const [status, setStatus] = useState<"checking" | "verified" | "denied" | "error" | "selecting">("checking");
  const [message, setMessage] = useState("Checking your location...");
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [isEnteringManually, setIsEnteringManually] = useState(false);
  const [nearbyLocation, setNearbyLocation] = useState<any | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  useEffect(() => {
    async function fetchLocations() {
      try {
        const { data } = await supabase
          .from("locations")
          .select("*");
        
        setSavedLocations(data || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    }

    fetchLocations();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation(position);
        
        const nearbyLoc = checkNearbyLocations(position);
        
        if (nearbyLoc) {
          setNearbyLocation(nearbyLoc);
          setSelectedLocation({
            id: nearbyLoc.id,
            name: nearbyLoc.name,
            address: nearbyLoc.address,
            hourly_rate: nearbyLoc.hourly_rate,
            latitude: nearbyLoc.latitude,
            longitude: nearbyLoc.longitude,
            zip_code: nearbyLoc.zip_code
          });
          setStatus("verified");
          setMessage(`You're at ${nearbyLoc.name}`);
        } else {
          setStatus("selecting");
          setMessage("Select a location or enter address manually");
          
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        }
      },
      (error) => {
        handleGeolocationError(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [savedLocations]);

  const handleGeolocationError = (error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setStatus("denied");
        setMessage("Location access denied. Please enable location services.");
        break;
      case error.POSITION_UNAVAILABLE:
        setStatus("error");
        setMessage("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        setStatus("error");
        setMessage("The request to get location timed out.");
        break;
      default:
        setStatus("error");
        setMessage("An unknown error occurred.");
    }
  };

  const checkNearbyLocations = (position: GeolocationPosition) => {
    if (!savedLocations.length) return null;
    
    for (const location of savedLocations) {
      if (location.latitude && location.longitude) {
        const distance = calculateDistance(
          position.coords.latitude, 
          position.coords.longitude,
          location.latitude,
          location.longitude
        );
        
        const radius = location.radius || 100;
        if (distance <= radius) {
          return location;
        }
      }
    }
    
    return null;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // Free geocoding service - OpenStreetMap's Nominatim API
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, {
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
      setManualAddress(address);
    } catch (error) {
      console.error("Error fetching address:", error);
      const mockAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      setManualAddress(mockAddress);
    }
  };

  return {
    status,
    setStatus,
    message,
    setMessage,
    currentLocation,
    savedLocations,
    selectedLocation,
    setSelectedLocation,
    manualAddress,
    setManualAddress,
    isEnteringManually,
    setIsEnteringManually,
    nearbyLocation,
    isMapOpen,
    setIsMapOpen
  };
}
