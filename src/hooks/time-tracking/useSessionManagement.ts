
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

interface UseSessionManagementProps {
  userId: string | null;
  locationDetails: LocationDetails | null;
  hourlyRate: number;
  overtimeRate: number;
  overtimeThreshold: number;
  totalBreakTime: number;
  startTime: Date | null;
  currentSessionId: string | null;
}

export function useSessionManagement({
  userId,
  locationDetails,
  hourlyRate,
  overtimeRate,
  overtimeThreshold,
  totalBreakTime,
  startTime,
  currentSessionId
}: UseSessionManagementProps) {
  const { toast } = useToast();
  const [endTime, setEndTime] = useState<Date | null>(null);

  // Create a new session in the database
  const createSession = async (now: Date) => {
    if (!userId || !locationDetails) return null;

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
    
    try {
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
        return null;
      } else if (data && data[0]) {
        console.log("Session created successfully:", data[0]);
        return data[0].id;
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
    return null;
  };

  // Complete the current session
  const completeSession = async (now: Date) => {
    if (!startTime || !currentSessionId) return;

    const durationMs = now.getTime() - startTime.getTime();
    
    // Subtract break time from total duration
    const breakTimeMs = totalBreakTime * 60 * 1000;
    const adjustedDurationMs = durationMs - breakTimeMs;
    const durationHours = adjustedDurationMs / (1000 * 60 * 60);
    
    console.log(`Total duration: ${durationHours.toFixed(2)} hours (with ${totalBreakTime} minutes breaks)`);
    
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
    console.log("Updating session with ID:", currentSessionId, {
      end_time: now.toISOString(),
      earnings: totalEarnings
    });
    
    try {
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
        return false;
      }
      
      // Create overtime period if applicable
      if (overtimeHours > 0 && userId) {
        const overtimeStart = new Date(startTime.getTime() + (overtimeThreshold * 60 * 60 * 1000) + breakTimeMs);
        
        const overtimeData = {
          user_id: userId,
          session_id: currentSessionId,
          start_time: overtimeStart.toISOString(),
          end_time: now.toISOString(),
          overtime_rate: overtimeRate,
          duration_minutes: Math.floor(overtimeHours * 60),
          earnings: overtimeEarnings
        };
        
        console.log("Creating overtime period:", overtimeData);
        
        const { error: overtimeError } = await supabase
          .from("overtime_periods")
          .insert(overtimeData);
        
        if (overtimeError) {
          console.error("Error recording overtime:", overtimeError);
        }
      }
      
      return {
        totalEarnings,
        overtimeEarnings,
        regularHours,
        overtimeHours,
        totalBreakTime
      };
    } catch (error) {
      console.error("Error updating session:", error);
      return false;
    }
  };

  return {
    endTime,
    setEndTime,
    createSession,
    completeSession
  };
}
