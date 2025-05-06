
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import { useTimerStorage } from "./useTimerStorage";
import { useSessionManagement } from "./useSessionManagement";
import { useLunchBreak } from "./useLunchBreak";
import { useUserRates } from "./useUserRates";
import { fetchAddressFromCoordinates } from "@/components/time-tracker/map/OpenStreetMapUtils";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";
import { toast } from "sonner";

interface UseTimeTrackingProps {
  isLocationVerified: boolean;
}

export const useTimeTracking = ({ isLocationVerified }: UseTimeTrackingProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  
  // Auto-detect location on initial load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const addressDetails = await fetchAddressFromCoordinates(latitude, longitude);
            
            if (addressDetails) {
              setLocationDetails({
                address: addressDetails.address,
                latitude: latitude,
                longitude: longitude,
                hourly_rate: 25, // Default rate
                street: addressDetails.street || null,
                city: addressDetails.city || null,
                state: addressDetails.state || null,
                zip_code: addressDetails.zipCode || null
              });
            }
          } catch (error) {
            console.error("Error getting location details:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Unable to determine location. Please allow access to geolocation.");
        }
      );
    }
  }, []);

  const {
    startTime,
    setStartTime,
    currentSessionId,
    setCurrentSessionId,
    isTracking,
    setIsTracking,
    saveTimerSession,
    saveSessionId,
    clearTimerStorage
  } = useTimerStorage();

  const { hourlyRate, overtimeRate, overtimeThreshold } = useUserRates(user?.id);

  const { 
    totalBreakTime,
    lunchBreakActive,
    startLunchBreak
  } = useLunchBreak({ isTracking });

  const {
    createSession,
    completeSession
  } = useSessionManagement({
    userId: user?.id || null,
    locationDetails,
    hourlyRate,
    overtimeRate,
    overtimeThreshold,
    totalBreakTime,
    startTime,
    currentSessionId
  });

  const handleLocationVerified = (verified: boolean, details?: any) => {
    if (verified && details) {
      setLocationDetails(details);
    }
  };

  const handleToggleTimer = async () => {
    setIsLoading(true);

    try {
      if (!isTracking) {
        // Starting the timer
        const now = new Date();
        setStartTime(now);
        setIsTracking(true);
        
        // Save to local storage first
        saveTimerSession(now, locationDetails);
        
        // Then create the session in the database if user is logged in
        if (user?.id) {
          console.log("Creating session for user:", user.id);
          const sessionId = await createSession(now);
          if (sessionId) {
            console.log("Session created with ID:", sessionId);
            saveSessionId(sessionId);
          } else {
            console.error("Failed to create session, no ID returned");
          }
        } else {
          console.log("No user ID available, not creating session in database");
        }
        
        toast.success("Timer started");
      } else {
        // Stopping the timer
        const now = new Date();
        
        // Complete the session in the database
        if (user?.id && currentSessionId) {
          console.log("Completing session:", currentSessionId);
          const result = await completeSession(now);
          
          if (result) {
            const { totalEarnings, overtimeEarnings } = result;
            
            toast.success(
              `Timer stopped. Earned: $${totalEarnings.toFixed(2)} ${overtimeEarnings > 0 ? `(including $${overtimeEarnings.toFixed(2)} overtime)` : ""}`
            );
          } else {
            console.error("Error completing session, no result returned");
            toast.error("Error completing session");
          }
        } else {
          console.log("No user ID or session ID available, not updating database");
          toast.success("Timer stopped");
        }
        
        // Reset state
        setStartTime(null);
        setCurrentSessionId(null);
        setIsTracking(false);
        clearTimerStorage();
      }
    } catch (error) {
      console.error("Error toggling timer:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isTracking,
    startTime,
    isLoading,
    hourlyRate,
    overtimeRate,
    overtimeThreshold,
    locationDetails,
    handleLocationVerified,
    handleToggleTimer,
    lunchBreakActive,
    startLunchBreak,
    totalBreakTime
  };
};
