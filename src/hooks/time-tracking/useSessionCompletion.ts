
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseSessionCompletionProps {
  userId: string | null;
  currentSessionId: string | null;
  startTime: Date | null;
  hourlyRate: number;
  overtimeRate: number;
  overtimeThreshold: number;
  totalBreakTime: number;
  setErrorMessage?: (message: string) => void;
}

export function useSessionCompletion({
  userId,
  currentSessionId,
  startTime,
  hourlyRate,
  overtimeRate,
  overtimeThreshold,
  totalBreakTime,
  setErrorMessage
}: UseSessionCompletionProps) {
  const [endTime, setEndTime] = useState<Date | null>(null);

  // Calculate earnings based on time worked
  const calculateEarnings = (
    startTimeValue: Date,
    endTimeValue: Date,
    breakTimeInMinutes: number
  ) => {
    const durationMs = endTimeValue.getTime() - startTimeValue.getTime();
    
    // Subtract break time from total duration
    const breakTimeMs = breakTimeInMinutes * 60 * 1000;
    const adjustedDurationMs = durationMs - breakTimeMs;
    const durationHours = adjustedDurationMs / (1000 * 60 * 60);
    
    console.log(`Total duration: ${durationHours.toFixed(2)} hours (with ${breakTimeInMinutes} minutes breaks)`);
    
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
    
    return {
      totalEarnings,
      overtimeEarnings,
      regularHours,
      overtimeHours,
      totalBreakTime: breakTimeInMinutes
    };
  };

  // Complete the current session
  const completeSession = async (now: Date) => {
    if (!startTime || !currentSessionId || !userId) {
      console.error("Missing required data for completing session", { 
        startTime, currentSessionId, userId 
      });
      if (setErrorMessage) {
        setErrorMessage("Missing data to complete session. Using local calculations.");
      }
      return null;
    }

    const earningsData = calculateEarnings(startTime, now, totalBreakTime);
    const { totalEarnings, overtimeEarnings, overtimeHours } = earningsData;
    
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
        // Handle specific error types
        if (pingError.message.includes("infinite recursion") || pingError.message.includes("team_members")) {
          if (setErrorMessage) {
            setErrorMessage("Team permissions issue. Using local calculations.");
          }
        } else if (pingError.message.includes("JWT") || pingError.message.includes("auth")) {
          if (setErrorMessage) {
            setErrorMessage("Authentication error. Please try logging in again.");
          }
        }
        
        // Return the earnings calculation
        return earningsData;
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
        // Handle specific error types
        if (error.message.includes("infinite recursion") || error.message.includes("team_members")) {
          if (setErrorMessage) {
            setErrorMessage("Team permissions issue. Using local calculations.");
          }
        } else {
          if (setErrorMessage) {
            setErrorMessage("Error saving to server. Using local calculations.");
          }
        }
        // Return the earnings anyway so the user can see them
        return earningsData;
      }
      
      // Create overtime period if applicable
      if (overtimeHours > 0 && userId) {
        await createOvertimePeriod(
          userId, 
          currentSessionId, 
          startTime, 
          now, 
          overtimeThreshold, 
          totalBreakTime, 
          overtimeRate, 
          overtimeHours, 
          overtimeEarnings
        );
      }
      
      return earningsData;
    } catch (error) {
      console.error("Exception updating session:", error);
      if (setErrorMessage) {
        setErrorMessage("Connection error. Using local earnings calculations.");
      }
      // Return the earnings calculation even if saving to server failed
      return earningsData;
    }
  };

  const createOvertimePeriod = async (
    userId: string,
    sessionId: string,
    startTime: Date,
    endTime: Date,
    overtimeThreshold: number,
    totalBreakTime: number,
    overtimeRate: number,
    overtimeHours: number,
    overtimeEarnings: number
  ) => {
    const breakTimeMs = totalBreakTime * 60 * 1000;
    const overtimeStart = new Date(startTime.getTime() + (overtimeThreshold * 60 * 60 * 1000) + breakTimeMs);
    
    const overtimeData = {
      user_id: userId,
      session_id: sessionId,
      start_time: overtimeStart.toISOString(),
      end_time: endTime.toISOString(),
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
  };

  return {
    endTime,
    setEndTime,
    completeSession,
    calculateEarnings
  };
}
