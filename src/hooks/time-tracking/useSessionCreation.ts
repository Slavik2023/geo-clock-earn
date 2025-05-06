
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

interface UseSessionCreationProps {
  userId: string | null;
  locationDetails: LocationDetails | null;
  hourlyRate: number;
  setErrorMessage?: (message: string) => void;
}

export function useSessionCreation({
  userId,
  locationDetails,
  hourlyRate,
  setErrorMessage
}: UseSessionCreationProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  // Create a new session in the database
  const createSession = async (now: Date) => {
    if (!userId || !locationDetails) {
      console.error("Missing userId or locationDetails, cannot create session");
      if (setErrorMessage) {
        setErrorMessage("Missing required data to create session");
      }
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
        
        // Check for specific policy recursion error
        if (pingError.message.includes("infinite recursion") || 
            pingError.message.includes("team_members")) {
          if (setErrorMessage) {
            setErrorMessage("Database policy error. Your time will be tracked locally.");
          }
          return null;
        }
        
        // If we can't even access the database, don't attempt to create a session
        if (pingError.message.includes("JWT") || 
            pingError.message.includes("auth")) {
          if (setErrorMessage) {
            setErrorMessage("Authentication error. Please try logging in again.");
          }
          return null;
        }
      }
      
      const { data, error } = await supabase
        .from("sessions")
        .insert(sessionData)
        .select();
      
      if (error) {
        console.error("Error creating session:", error);
        
        // Handle specific error types
        if (error.message.includes("infinite recursion") || error.message.includes("team_members")) {
          if (setErrorMessage) {
            setErrorMessage("There's an issue with team permissions. Your time is tracked locally.");
          }
        } else {
          if (setErrorMessage) {
            setErrorMessage("Server connection issue. Working in offline mode.");
          }
        }
        
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
      if (setErrorMessage) {
        setErrorMessage("Error connecting to server. Working in offline mode.");
      }
      return null;
    }
  };

  return {
    createSession,
    isRetrying,
    setIsRetrying
  };
}
