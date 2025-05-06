
import { useState, useEffect } from "react";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

export const useTimeTrackingState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [localTimerActive, setLocalTimerActive] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  
  // Load state from localStorage on mount
  useEffect(() => {
    const activeTimerStart = localStorage.getItem("activeTimerStart");
    if (activeTimerStart) {
      setLocalTimerActive(true);
    }
    
    const activeLocationDetails = localStorage.getItem("activeLocationDetails");
    if (activeLocationDetails) {
      try {
        setLocationDetails(JSON.parse(activeLocationDetails));
      } catch (error) {
        console.error("Error parsing location details:", error);
      }
    }
  }, []);

  return {
    isLoading,
    setIsLoading,
    locationDetails,
    setLocationDetails,
    localTimerActive,
    setLocalTimerActive,
    errorOccurred,
    setErrorOccurred,
    retryAttempts,
    setRetryAttempts
  };
};
