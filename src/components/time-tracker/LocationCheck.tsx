
import { useState, useEffect } from "react";
import { MapPinIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationCheckProps {
  onLocationVerified: (verified: boolean) => void;
}

export function LocationCheck({ onLocationVerified }: LocationCheckProps) {
  const [status, setStatus] = useState<"checking" | "verified" | "denied" | "error">("checking");
  const [message, setMessage] = useState("Checking your location...");

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("Geolocation is not supported by your browser");
      onLocationVerified(false);
      return;
    }

    // Request the user's position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, you would validate the position against known work locations
        // For demo purposes, we'll just simulate a successful verification
        setStatus("verified");
        setMessage("Your location has been verified");
        onLocationVerified(true);
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
  }, [onLocationVerified]);

  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-3 rounded-md",
        status === "checking" && "bg-blue-50 text-blue-600",
        status === "verified" && "bg-green-50 text-green-600",
        status === "denied" && "bg-red-50 text-red-600",
        status === "error" && "bg-yellow-50 text-yellow-600",
      )}
    >
      {status === "checking" && (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
      )}
      {status === "verified" && <CheckCircleIcon className="h-5 w-5" />}
      {status === "denied" && <AlertCircleIcon className="h-5 w-5" />}
      {status === "error" && <AlertCircleIcon className="h-5 w-5" />}
      
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {status === "checking" && "Verifying Location"}
          {status === "verified" && "Location Verified"}
          {status === "denied" && "Location Access Denied"}
          {status === "error" && "Location Error"}
        </span>
        <span className="text-xs">{message}</span>
      </div>
    </div>
  );
}
