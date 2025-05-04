
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LocationDetails } from "@/components/time-tracker/EnhancedLocationCheck";
import { UseTimeTrackingProps } from "./types";
import { useLunchBreak } from "./useLunchBreak";
import { useTimerStorage } from "./useTimerStorage";
import { useUserRates } from "./useUserRates";
import { useSessionManagement } from "./useSessionManagement";

export function useTimeTracking({ isLocationVerified }: UseTimeTrackingProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get the timer storage state
  const {
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
  } = useTimerStorage();
  
  // Get the lunch break functionality
  const {
    lunchBreakActive,
    lunchBreakStart,
    totalBreakTime,
    startLunchBreak,
    endLunchBreak,
    resetBreakTime
  } = useLunchBreak({ isTracking });
  
  // Get user rates
  const {
    hourlyRate,
    setHourlyRate,
    overtimeRate,
    setOvertimeRate,
    overtimeThreshold,
    setOvertimeThreshold
  } = useUserRates(userId);
  
  // Get session management
  const {
    endTime,
    setEndTime,
    createSession,
    completeSession
  } = useSessionManagement({
    userId,
    locationDetails,
    hourlyRate,
    overtimeRate,
    overtimeThreshold,
    totalBreakTime,
    startTime,
    currentSessionId
  });
  
  // Get current user
  useEffect(() => {
    async function getUserId() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    }
    
    getUserId();
  }, []);

  // Update hourly rate from location details when tracking starts
  useEffect(() => {
    if (locationDetails) {
      if (locationDetails.hourly_rate) {
        setHourlyRate(locationDetails.hourly_rate);
      }
      
      if (locationDetails.overtime_rate) {
        setOvertimeRate(locationDetails.overtime_rate);
      } else if (locationDetails.hourly_rate) {
        // Default overtime rate is 1.5x the hourly rate
        setOvertimeRate(locationDetails.hourly_rate * 1.5);
      }
    }
  }, [locationDetails]);

  const handleLocationVerified = (verified: boolean, details?: LocationDetails) => {
    if (verified && details) {
      setLocationDetails(details);
      if (details.hourly_rate) {
        setHourlyRate(details.hourly_rate);
        setOvertimeRate(details.overtime_rate || details.hourly_rate * 1.5);
      }
    } else if (!verified) {
      toast({
        variant: "destructive",
        title: "Location Not Verified",
        description: "Please enable location services to use time tracking."
      });
    }
  };

  const handleToggleTimer = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be signed in to track time."
      });
      return;
    }
    
    if (!isLocationVerified && !isTracking) {
      toast({
        variant: "destructive",
        title: "Location Required",
        description: "Your location must be verified before tracking time."
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!isTracking) {
        // Start tracking
        const now = new Date();
        setStartTime(now);
        setIsTracking(true);
        resetBreakTime();
        
        // Save to localStorage
        saveTimerSession(now, locationDetails);
        
        // Create a new session in the database
        if (locationDetails) {
          const sessionId = await createSession(now);
          if (sessionId) {
            saveSessionId(sessionId);
          }
        }
        
        toast({
          title: "Time Tracking Started",
          description: `Started at ${now.toLocaleTimeString()} at ${locationDetails?.name || locationDetails?.address || 'current location'}`,
        });
      } else {
        // End the current lunch break if active
        if (lunchBreakActive) {
          endLunchBreak();
        }
        
        // Stop tracking
        const now = new Date();
        setEndTime(now);
        setIsTracking(false);
        
        // Complete the current session
        const result = await completeSession(now);
        
        if (result && typeof result !== 'boolean') {
          const { totalEarnings, overtimeEarnings, totalBreakTime } = result;
          
          // Prepare toast message with overtime details if applicable
          let earningsMessage = `You earned $${totalEarnings.toFixed(2)} for this session.`;
          if (overtimeEarnings > 0) {
            earningsMessage = `You earned $${totalEarnings.toFixed(2)} (includes $${overtimeEarnings.toFixed(2)} overtime) for this session.`;
          }
          
          if (totalBreakTime > 0) {
            earningsMessage += ` Total break time: ${totalBreakTime} minutes.`;
          }
          
          toast({
            title: "Time Tracking Stopped",
            description: earningsMessage,
          });
        }
        
        // Clear the active timer
        clearTimerStorage();
        
        // After a short delay, reset the start time
        setTimeout(() => {
          setStartTime(null);
          setCurrentSessionId(null);
          resetBreakTime();
        }, 3000);
      }
    } catch (error) {
      console.error("Time tracking error:", error);
      toast({
        variant: "destructive",
        title: `Error ${isTracking ? "Stopping" : "Starting"} Timer`,
        description: "There was an error with the time tracking operation."
      });
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
    endLunchBreak,
    totalBreakTime
  };
}
