
import { useEffect, useState } from "react";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

export function useTimerStorage() {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  // Load active timer from localStorage 
  useEffect(() => {
    const activeTimerStart = localStorage.getItem("activeTimerStart");
    const activeSessionId = localStorage.getItem("activeSessionId");
    const activeLocationDetails = localStorage.getItem("activeLocationDetails");
    
    if (activeTimerStart) {
      setStartTime(new Date(activeTimerStart));
      setIsTracking(true);
      setCurrentSessionId(activeSessionId);
      
      if (activeLocationDetails) {
        const parsedLocationDetails = JSON.parse(activeLocationDetails);
        setLocationDetails(parsedLocationDetails);
      }
    }
  }, []);

  const saveTimerSession = (now: Date, details: LocationDetails | null) => {
    localStorage.setItem("activeTimerStart", now.toISOString());
    
    if (details) {
      localStorage.setItem("activeLocationDetails", JSON.stringify(details));
    }
  };

  const saveSessionId = (sessionId: string) => {
    localStorage.setItem("activeSessionId", sessionId);
    setCurrentSessionId(sessionId);
  };

  const clearTimerStorage = () => {
    localStorage.removeItem("activeTimerStart");
    localStorage.removeItem("activeSessionId");
    localStorage.removeItem("activeLocationDetails");
    localStorage.removeItem("activeLunchBreakTotal");
  };

  return {
    startTime,
    setStartTime,
    currentSessionId,
    setCurrentSessionId,
    locationDetails,
    setLocationDetails,
    isTracking,
    setIsTracking,
    saveTimerSession,
    saveSessionId,
    clearTimerStorage
  };
}
