import { useState, useEffect } from "react";
import { MapPin, AlertCircle, CheckCircle, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LocationsManager } from "./LocationsManager";

interface EnhancedLocationCheckProps {
  onLocationVerified: (verified: boolean, locationDetails?: LocationDetails) => void;
}

export interface LocationDetails {
  id?: string;
  name?: string;
  address: string;
  hourly_rate: number;
  overtime_rate?: number;
  latitude?: number | null;
  longitude?: number | null;
  zip_code?: string | null;
}

export function EnhancedLocationCheck({ onLocationVerified }: EnhancedLocationCheckProps) {
  const [status, setStatus] = useState<"checking" | "verified" | "denied" | "error" | "selecting">("checking");
  const [message, setMessage] = useState("Checking your location...");
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [isEnteringManually, setIsEnteringManually] = useState(false);
  const [nearbyLocation, setNearbyLocation] = useState<any | null>(null);

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
      onLocationVerified(false);
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
          onLocationVerified(true, {
            id: nearbyLoc.id,
            name: nearbyLoc.name,
            address: nearbyLoc.address,
            hourly_rate: nearbyLoc.hourly_rate,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            zip_code: nearbyLoc.zip_code
          });
        } else {
          setStatus("selecting");
          setMessage("Select a location or enter address manually");
          
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        }
      },
      (error) => {
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
        onLocationVerified(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onLocationVerified, savedLocations]);

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
    const mockAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    setManualAddress(mockAddress);
  };

  const handleManualEntry = () => {
    if (manualAddress.trim() === "") return;
    
    setSelectedLocation({
      address: manualAddress,
      hourly_rate: 25,
      latitude: currentLocation?.coords.latitude,
      longitude: currentLocation?.coords.longitude
    });
    
    setStatus("verified");
    setMessage("Manual location verified");
    
    onLocationVerified(true, {
      address: manualAddress,
      hourly_rate: 25,
      latitude: currentLocation?.coords.latitude,
      longitude: currentLocation?.coords.longitude
    });
    
    setIsEnteringManually(false);
  };

  const handleLocationSelected = (location: any) => {
    setSelectedLocation({
      id: location.id,
      name: location.name,
      address: location.address,
      hourly_rate: location.hourly_rate,
      latitude: currentLocation?.coords.latitude || location.latitude,
      longitude: currentLocation?.coords.longitude || location.longitude,
      zip_code: location.zip_code
    });
    
    setStatus("verified");
    setMessage(`Selected location: ${location.name}`);
    
    onLocationVerified(true, {
      id: location.id,
      name: location.name,
      address: location.address,
      hourly_rate: location.hourly_rate,
      latitude: currentLocation?.coords.latitude || location.latitude,
      longitude: currentLocation?.coords.longitude || location.longitude,
      zip_code: location.zip_code
    });
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-3 rounded-md",
        status === "checking" && "bg-blue-50 text-blue-600",
        status === "verified" && "bg-green-50 text-green-600",
        status === "denied" && "bg-red-50 text-red-600",
        status === "error" && "bg-yellow-50 text-yellow-600",
        status === "selecting" && "bg-blue-50 text-blue-600",
      )}
    >
      {status === "checking" && (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
      )}
      {status === "verified" && <CheckCircle className="h-5 w-5" />}
      {status === "denied" && <AlertCircle className="h-5 w-5" />}
      {status === "error" && <AlertCircle className="h-5 w-5" />}
      {status === "selecting" && <MapPin className="h-5 w-5" />}
      
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium">
          {status === "checking" && "Checking Location"}
          {status === "verified" && "Location Verified"}
          {status === "denied" && "Location Access Denied"}
          {status === "error" && "Location Error"}
          {status === "selecting" && "Select Location"}
        </span>
        <span className="text-xs">{message}</span>
        
        {status === "selecting" && !isEnteringManually && (
          <div className="mt-2 flex flex-wrap gap-2">
            {savedLocations.length > 0 ? (
              <>
                <div className="w-full mt-1 mb-1">
                  <p className="text-xs font-medium">Saved locations:</p>
                </div>
                {savedLocations.slice(0, 3).map((location) => (
                  <Button 
                    key={location.id} 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleLocationSelected(location)}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {location.name}
                  </Button>
                ))}
                
                {savedLocations.length > 3 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        +{savedLocations.length - 3} more
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Choose a Location</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {savedLocations.map((location) => (
                          <Button 
                            key={location.id} 
                            variant="outline" 
                            onClick={() => {
                              handleLocationSelected(location);
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
            ) : (
              <p className="text-xs mt-1">No saved locations.</p>
            )}
            
            <div className="w-full mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEnteringManually(true)}
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
        )}
        
        {status === "selecting" && isEnteringManually && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              placeholder="Enter address"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
            />
            <Button 
              size="sm" 
              onClick={handleManualEntry}
            >
              Confirm
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsEnteringManually(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
