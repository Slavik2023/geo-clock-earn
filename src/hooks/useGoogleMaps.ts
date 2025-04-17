
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseGoogleMapsProps {
  apiKey: string;
  onMapLoad?: (map: google.maps.Map, marker: google.maps.Marker) => void;
}

interface SelectedLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export function useGoogleMaps({ apiKey, onMapLoad }: UseGoogleMapsProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Initialize search box
    initializeSearchBox(newMap, newMarker);

    // Call onMapLoad callback if provided
    if (onMapLoad) {
      onMapLoad(newMap, newMarker);
    }
  };

  const initializeSearchBox = (newMap: google.maps.Map, newMarker: google.maps.Marker) => {
    if (searchInputRef.current) {
      const searchBox = new google.maps.places.SearchBox(searchInputRef.current);
      
      // Position the search input outside the map control system
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

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        if (map && marker) {
          map.setCenter(pos);
          marker.setPosition(pos);
          
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

  return {
    map,
    marker,
    googleMapsLoaded,
    selectedLocation,
    isLocating,
    mapRef,
    searchInputRef,
    loadGoogleMapsApi,
    handleGetCurrentLocation,
    setSelectedLocation
  };
}
