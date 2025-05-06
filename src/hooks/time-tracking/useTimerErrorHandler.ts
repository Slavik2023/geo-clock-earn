
import { toast } from "sonner";

export const useTimerErrorHandler = () => {
  const handleError = (error: any) => {
    console.error("Error toggling timer:", error);
    
    // Check for specific error types
    if (error?.message?.includes("network") || error?.code === "NETWORK_ERROR") {
      toast.error("Network connection error. Please check your internet connection and try again.");
    } else if (error?.code?.includes("PERMISSION_DENIED") || error?.message?.includes("permission")) {
      toast.error("Permission denied. You don't have access to perform this action.");
    } else if (error?.message?.includes("recursion") || error?.code === "42P17") {
      toast.error("Database query error. Please try again or contact support.");
    } else {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleSessionLoadError = (error: any) => {
    console.error("Error loading sessions:", error);
    
    // Check for specific error types
    if (error?.message?.includes("recursion") || error?.code === "42P17") {
      toast.error("Database query error. The system is having trouble loading your sessions.");
    } else if (error?.message?.includes("network") || error?.code === "NETWORK_ERROR") {
      toast.error("Network connection error. Please check your internet connection.");
    } else {
      toast.error("Could not load sessions. Using local data if available.");
    }
    
    return [];
  };

  return { 
    handleError,
    handleSessionLoadError
  };
};
