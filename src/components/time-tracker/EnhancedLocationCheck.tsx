
import { LocationStatusIndicator } from "./location/LocationStatusIndicator";
import { LocationSelectionOptions } from "./location/LocationSelectionOptions";
import { ManualAddressEntry } from "./location/ManualAddressEntry";
import { useLocationCheck } from "@/hooks/time-tracking/useLocationCheck";
import { EnhancedLocationCheckProps, LocationDetails } from "./types/LocationTypes";

export function EnhancedLocationCheck({ onLocationVerified }: EnhancedLocationCheckProps) {
  const {
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
  } = useLocationCheck();

  // Effect to notify parent when a nearby location is found automatically
  if (status === "verified" && nearbyLocation && selectedLocation) {
    onLocationVerified(true, {
      id: nearbyLocation.id,
      name: nearbyLocation.name,
      address: nearbyLocation.address,
      hourly_rate: nearbyLocation.hourly_rate,
      latitude: currentLocation?.coords.latitude,
      longitude: currentLocation?.coords.longitude,
      zip_code: nearbyLocation.zip_code
    });
  }

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

  const handleMapLocationSelected = (location: { 
    address: string; 
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    latitude: number; 
    longitude: number 
  }) => {
    setSelectedLocation({
      address: location.address,
      hourly_rate: 25,
      latitude: location.latitude,
      longitude: location.longitude,
      street: location.street || null,
      city: location.city || null,
      state: location.state || null,
      zip_code: location.zipCode || null
    });
    
    setStatus("verified");
    setMessage(`Map location selected: ${location.address}`);
    
    onLocationVerified(true, {
      address: location.address,
      hourly_rate: 25,
      latitude: location.latitude,
      longitude: location.longitude,
      street: location.street || null,
      city: location.city || null,
      state: location.state || null,
      zip_code: location.zipCode || null
    });
    
    setIsMapOpen(false);
  };

  return (
    <div>
      <LocationStatusIndicator status={status} message={message} />
      
      {status === "selecting" && !isEnteringManually && (
        <LocationSelectionOptions
          savedLocations={savedLocations}
          onLocationSelected={handleLocationSelected}
          onManualEntryClick={() => setIsEnteringManually(true)}
          isMapOpen={isMapOpen}
          setIsMapOpen={setIsMapOpen}
          onMapLocationSelected={handleMapLocationSelected}
        />
      )}
      
      {status === "selecting" && isEnteringManually && (
        <ManualAddressEntry
          address={manualAddress}
          onAddressChange={setManualAddress}
          onConfirm={handleManualEntry}
          onCancel={() => setIsEnteringManually(false)}
        />
      )}
    </div>
  );
}
