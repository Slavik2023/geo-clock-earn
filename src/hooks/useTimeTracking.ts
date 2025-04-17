
import { useState, useEffect } from "react";
import { supabase, UserSettings } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LocationDetails } from "@/components/time-tracker/EnhancedLocationCheck";

interface UseTimeTrackingProps {
  isLocationVerified: boolean;
}

export function useTimeTracking({ isLocationVerified }: UseTimeTrackingProps) {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [overtimeRate, setOvertimeRate] = useState(37.5);
  const [overtimeThreshold, setOvertimeThreshold] = useState(8);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user and load user settings
  useEffect(() => {
    async function getUserAndSettings() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        
        // Load user settings from Supabase
        const { data: settingsData, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
        
        if (settingsData) {
          setHourlyRate(settingsData.hourly_rate);
          setOvertimeRate(settingsData.overtime_rate || 37.5);
          setOvertimeThreshold(settingsData.overtime_threshold || 8);
        }
        
        if (error) {
          console.error("Error loading user settings:", error);
        }
      }
    }
    
    getUserAndSettings();
  }, []);

  // Load active timer from localStorage (to be migrated to Supabase in future)
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
        setHourlyRate(parsedLocationDetails.hourly_rate || 25);
        // Default overtime rate to 1.5x hourly rate if not specified
        setOvertimeRate(parsedLocationDetails.overtime_rate || parsedLocationDetails.hourly_rate * 1.5 || 37.5);
      }
    }
  }, []);

  const handleLocationVerified = (verified: boolean, details?: LocationDetails) => {
    if (verified && details) {
      setLocationDetails(details);
      setHourlyRate(details.hourly_rate || 25);
      // Default overtime rate to 1.5x hourly rate
      setOvertimeRate(details.overtime_rate || details.hourly_rate * 1.5);
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
        
        // Save to localStorage
        localStorage.setItem("activeTimerStart", now.toISOString());
        localStorage.setItem("activeLocationDetails", JSON.stringify(locationDetails));
        
        // Create a new session in the database
        if (locationDetails) {
          const sessionData = {
            user_id: userId,
            location_id: locationDetails.id,
            start_time: now.toISOString(),
            hourly_rate: locationDetails.hourly_rate || hourlyRate,
            address: locationDetails.address,
            latitude: locationDetails.latitude,
            longitude: locationDetails.longitude,
            is_manual_entry: !locationDetails.id // If no location ID, it's a manual entry
          };
          
          console.log("Creating session with data:", sessionData);
          
          const { data, error } = await supabase
            .from("sessions")
            .insert(sessionData)
            .select();
          
          if (error) {
            console.error("Error creating session:", error);
            toast({
              variant: "destructive",
              title: "Error Starting Timer",
              description: error.message || "There was an error starting the timer."
            });
          } else if (data && data[0]) {
            console.log("Session created successfully:", data[0]);
            setCurrentSessionId(data[0].id);
            localStorage.setItem("activeSessionId", data[0].id);
          }
        }
        
        toast({
          title: "Time Tracking Started",
          description: `Started at ${now.toLocaleTimeString()} at ${locationDetails?.name || locationDetails?.address || 'current location'}`,
        });
      } else {
        // Stop tracking
        const now = new Date();
        setEndTime(now);
        setIsTracking(false);
        
        // Calculate duration and earnings
        if (startTime) {
          const durationMs = now.getTime() - startTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          
          // Calculate regular and overtime hours
          let regularHours = durationHours;
          let overtimeHours = 0;
          
          if (durationHours > overtimeThreshold) {
            regularHours = overtimeThreshold;
            overtimeHours = durationHours - overtimeThreshold;
          }
          
          // Calculate earnings
          const regularEarnings = regularHours * hourlyRate;
          const overtimeEarnings = overtimeHours * overtimeRate;
          const totalEarnings = regularEarnings + overtimeEarnings;
          
          // Update the session in the database
          if (currentSessionId) {
            console.log("Updating session with ID:", currentSessionId, {
              end_time: now.toISOString(),
              earnings: totalEarnings
            });
            
            const { error } = await supabase
              .from("sessions")
              .update({
                end_time: now.toISOString(),
                earnings: totalEarnings
              })
              .eq("id", currentSessionId);
            
            if (error) {
              console.error("Error updating session:", error);
              toast({
                variant: "destructive",
                title: "Error Stopping Timer",
                description: error.message || "There was an error stopping the timer."
              });
            } else {
              console.log("Session updated successfully");
            }
          }
          
          // Prepare toast message with overtime details if applicable
          let earningsMessage = `You earned $${totalEarnings.toFixed(2)} for this session.`;
          if (overtimeHours > 0) {
            earningsMessage = `You earned $${totalEarnings.toFixed(2)} (includes $${overtimeEarnings.toFixed(2)} overtime) for this session.`;
          }
          
          toast({
            title: "Time Tracking Stopped",
            description: earningsMessage,
          });
          
          // Clear the active timer
          localStorage.removeItem("activeTimerStart");
          localStorage.removeItem("activeSessionId");
          localStorage.removeItem("activeLocationDetails");
          
          // After a short delay, reset the start time
          setTimeout(() => {
            setStartTime(null);
            setCurrentSessionId(null);
          }, 3000);
        }
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
    handleToggleTimer
  };
}
