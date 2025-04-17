
import { useEffect, useRef, useState } from "react";
import { MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LocationsMapProps {
  onSelectLocation: (location: { address: string; latitude: number; longitude: number }) => void;
}

export function LocationsMap({ onSelectLocation }: LocationsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  // Load Google Maps API
  const loadGoogleMapsApi = () => {
    if (!apiKey) return;
    
    // Check if API is already loaded
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      initializeMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setGoogleMapsLoaded(true);
      setShowApiKeyInput(false);
      initializeMap();
    };
    
    script.onerror = () => {
      toast.error("Failed to load Google Maps. Please check your API key.");
    };
    
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Initialize the map
    const newMap = new google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 13,
      mapTypeControl: false,
    });

    setMap(newMap);

    // Create a marker for the selected location
    const newMarker = new google.maps.Marker({
      map: newMap,
      draggable: true,
      position: newMap.getCenter(),
    });

    setMarker(newMarker);

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          newMap.setCenter(pos);
          newMarker.setPosition(pos);
          
          // Get address for the current location
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: pos }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              setSelectedLocation({
                address,
                latitude: pos.lat,
                longitude: pos.lng,
              });
            }
          });
        },
        () => {
          toast.error("Error: Unable to retrieve your location.");
        }
      );
    }

    // Handle marker drag end
    newMarker.addListener("dragend", () => {
      const position = newMarker.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        
        // Get address for the new position
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const address = results[0].formatted_address;
            setSelectedLocation({
              address,
              latitude: lat,
              longitude: lng,
            });
          }
        });
      }
    });

    // Create search box
    if (searchInputRef.current) {
      const searchBox = new google.maps.places.SearchBox(searchInputRef.current);
      
      // Position the search input outside the map control system
      // Instead of trying to push the HTML element to map controls, we'll style it to appear over the map
      if (searchInputRef.current) {
        searchInputRef.current.style.position = "relative";
        searchInputRef.current.style.zIndex = "10";
        searchInputRef.current.style.margin = "10px auto";
        searchInputRef.current.style.display = "block";
      }
      
      // Listen for the event fired when the user selects a prediction
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        
        if (!places || places.length === 0) return;
        
        const place = places[0];
        
        if (!place.geometry || !place.geometry.location) return;
        
        // Update marker and map
        newMarker.setPosition(place.geometry.location);
        newMap.setCenter(place.geometry.location);
        
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setSelectedLocation({
          address: place.formatted_address || "",
          latitude: lat,
          longitude: lng,
        });
      });
    }
  };

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
  }, [apiKey, googleMapsLoaded]);

  return (
    <div className="flex flex-col gap-4">
      {showApiKeyInput && (
        <div className="p-4 border rounded-md bg-yellow-50">
          <h3 className="text-sm font-semibold mb-2">Google Maps API Key Required</h3>
          <p className="text-xs mb-3">
            To use the location map, please enter your Google Maps API key.
          </p>
          <div className="flex gap-2">
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Google Maps API Key"
              className="text-sm"
            />
            <Button 
              onClick={loadGoogleMapsApi} 
              disabled={!apiKey}
              size="sm"
            >
              Load Map
            </Button>
          </div>
        </div>
      )}

      {!showApiKeyInput && (
        <>
          <div className="relative">
            <input
              id="pac-input"
              ref={searchInputRef}
              className="w-full max-w-xs mx-auto p-2 border rounded-md shadow-sm text-sm"
              type="text"
              placeholder="Search for a location"
            />
          </div>

          <div ref={mapRef} className="w-full h-[300px] rounded-md border mb-2 bg-gray-100" />

          {selectedLocation && (
            <div className="p-3 border rounded-md bg-blue-50">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Selected Location</p>
                  <p className="text-xs text-gray-600">{selectedLocation.address}</p>
                </div>
                <Button onClick={handleConfirmLocation} variant="outline" size="sm" className="h-8">
                  <Check className="h-3 w-3 mr-1" />
                  Use This
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
