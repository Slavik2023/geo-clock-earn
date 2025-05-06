
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Create a new session in the database
  const createSession = async (now: Date) => {
    if (!userId || !locationDetails) {
      console.error("Missing userId or locationDetails, cannot create session");
      return null;
    }

    // Define the required fields explicitly to match the database schema
    const sessionData: any = {
      user_id: userId,
      start_time: now.toISOString(),
      hourly_rate: locationDetails.hourly_rate || hourlyRate,
      address: locationDetails.address,
    };
    
    // Add optional fields only if they exist
    if (locationDetails.latitude) sessionData['latitude'] = locationDetails.latitude;
    if (locationDetails.longitude) sessionData['longitude'] = locationDetails.longitude;
    if (locationDetails.id) sessionData['location_id'] = locationDetails.id;
    
    // Set is_manual_entry based on whether there is a location ID
    sessionData['is_manual_entry'] = !locationDetails.id;
    
    console.log("Creating session with data:", sessionData);
    
    try {
      // First, check if the user can access the database
      const { error: pingError } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", userId)
        .limit(1);
        
      if (pingError) {
        console.error("Database connection test failed:", pingError);
        
        // If we can't even access the database, don't attempt to create a session
        if (pingError.message.includes("infinite recursion") || 
            pingError.message.includes("JWT") || 
            pingError.message.includes("auth")) {
          return null;
        }
      }
      
      const { data, error } = await supabase
        .from("sessions")
        .insert(sessionData)
        .select();
      
      if (error) {
        console.error("Error creating session:", error);
        
        if (isRetrying) {
          // If this was already a retry attempt, don't show another toast
          console.log("Retry also failed");
        } else {
          toast.error("Error saving session to server, local timer will continue");
        }
        return null;
      } else if (data && data[0]) {
        console.log("Session created successfully:", data[0]);
        return data[0].id;
      } else {
        console.error("No data returned from session creation");
        return null;
      }
    } catch (error) {
      console.error("Exception creating session:", error);
      return null;
    }
  };

  // Complete the current session
  const completeSession = async (now: Date) => {
    if (!startTime || !currentSessionId || !userId) {
      console.error("Missing required data for completing session", { 
        startTime, currentSessionId, userId 
      });
      return null;
    }

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
      // First, check if we can connect to the database
      const { error: pingError } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", userId)
        .limit(1);
        
      if (pingError) {
        console.error("Database connection test failed:", pingError);
        // If we can't access the database, return the earnings calculation
        // so we can still show the user their earnings
        if (pingError.message.includes("infinite recursion") || 
            pingError.message.includes("JWT") || 
            pingError.message.includes("auth")) {
          return {
            totalEarnings,
            overtimeEarnings,
            regularHours,
            overtimeHours,
            totalBreakTime
          };
        }
      }
    
      const { error } = await supabase
        .from("sessions")
        .update({
          end_time: now.toISOString(),
          earnings: totalEarnings
        })
        .eq("id", currentSessionId);
      
      if (error) {
        console.error("Error updating session:", error);
        
        // Return the earnings anyway so the user can see them
        return {
          totalEarnings,
          overtimeEarnings,
          regularHours,
          overtimeHours,
          totalBreakTime
        };
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
      console.error("Exception updating session:", error);
      
      // Return the earnings calculation even if saving to server failed
      return {
        totalEarnings,
        overtimeEarnings,
        regularHours,
        overtimeHours,
        totalBreakTime
      };
    }
  };

  return {
    endTime,
    setEndTime,
    createSession,
    completeSession
  };
}
