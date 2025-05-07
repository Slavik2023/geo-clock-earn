
import { toast } from "sonner";
import { getOfflineSessions } from "@/components/time-tracker/services/sessionService";
import { WorkSession } from "@/components/time-tracker/WorkSessionCard";

export function useTimerErrorHandler() {
  const handleSessionLoadError = (error: any): WorkSession[] => {
    let errorMessage = "Could not load sessions";
    
    if (error.message?.includes("Failed to fetch")) {
      errorMessage = "Network error: Check your internet connection";
    } else if (error.message?.includes("JWT")) {
      errorMessage = "Authentication error: Please log in again";
    } else if (error.code === "PGRST301") {
      errorMessage = "Session expired: Please log in again";
    }
    
    toast.error(errorMessage);
    
    // Return offline sessions as fallback
    return getOfflineSessions();
  };
  
  const handleError = (error: any, defaultMessage: string = "An error occurred") => {
    let errorMessage = defaultMessage;
    
    if (error.message?.includes("Failed to fetch")) {
      errorMessage = "Network error: Check your internet connection";
    } else if (error.message?.includes("JWT")) {
      errorMessage = "Authentication error: Please log in again";
    } else if (error.code === "PGRST301") {
      errorMessage = "Session expired: Please log in again";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    console.error("Handled error:", error);
    
    return errorMessage;
  };

  return { handleSessionLoadError, handleError };
}
