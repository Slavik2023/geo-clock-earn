
import { useEffect, useState } from "react";
import { ApiKeyInput } from "./map/ApiKeyInput";
import { SearchControls } from "./map/SearchControls";
import { SelectedLocationDisplay } from "./map/SelectedLocationDisplay";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface LocationsMapProps {
  onSelectLocation: (location: { address: string; latitude: number; longitude: number }) => void;
}

export function LocationsMap({ onSelectLocation }: LocationsMapProps) {
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  
  const {
    googleMapsLoaded,
    selectedLocation,
    isLocating,
    mapRef,
    searchInputRef,
    loadGoogleMapsApi,
    handleGetCurrentLocation
  } = useGoogleMaps({ 
    apiKey,
    onMapLoad: () => setShowApiKeyInput(false)
  });

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
    }
  };

  useEffect(() => {
    // Check if the API key is in localStorage
    const savedApiKey = localStorage.getItem("googleMapsApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(false);
    }
  }, []);

  useEffect(() => {
    if (apiKey && !googleMapsLoaded) {
      loadGoogleMapsApi();
      localStorage.setItem("googleMapsApiKey", apiKey);
    }
  }, [apiKey, googleMapsLoaded, loadGoogleMapsApi]);

  return (
    <div className="flex flex-col gap-4">
      {showApiKeyInput && (
        <ApiKeyInput
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onLoadMap={loadGoogleMapsApi}
        />
      )}

      {!showApiKeyInput && (
        <>
          <SearchControls
            searchInputRef={searchInputRef}
            isLocating={isLocating}
            onGetCurrentLocation={handleGetCurrentLocation}
          />

          <div ref={mapRef} className="w-full h-[300px] rounded-md border mb-2 bg-gray-100" />

          {selectedLocation && (
            <SelectedLocationDisplay
              address={selectedLocation.address}
              onConfirm={handleConfirmLocation}
            />
          )}
        </>
      )}
    </div>
  );
}
