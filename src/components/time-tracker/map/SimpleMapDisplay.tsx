
import { useRef, useEffect } from "react";

interface SimpleMapDisplayProps {
  latitude: number;
  longitude: number;
  isLocating?: boolean;
}

export function SimpleMapDisplay({ latitude, longitude, isLocating = false }: SimpleMapDisplayProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isLocating) {
      // Show loading state
      if (mapContainerRef.current) {
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
    } else if (mapContainerRef.current) {
      // Show map with marker
      updateMapMarker(latitude, longitude);
    }
  }, [latitude, longitude, isLocating]);
  
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

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-[300px] rounded-md border mb-2 bg-gray-100 overflow-hidden" 
    />
  );
}
