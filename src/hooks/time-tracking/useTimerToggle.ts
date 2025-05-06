
import { useCallback } from "react";
import { toast } from "sonner";
import { saveSessionToLocalStorage } from "@/components/time-tracker/services/sessionService";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

interface UseTimerToggleProps {
  isTracking: boolean;
  startTime: Date | null;
  setStartTime: (time: Date | null) => void;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  setIsTracking: (isTracking: boolean) => void;
  saveTimerSession: (now: Date, locationDetails: LocationDetails | null) => void;
  clearTimerStorage: () => void;
  createSession: (now: Date) => Promise<string | null>;
  completeSession: (now: Date) => Promise<any>;
  locationDetails: LocationDetails | null;
  hourlyRate: number;
  overtimeRate: number;
  overtimeThreshold: number;
  totalBreakTime: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorOccurred: boolean;
  setErrorOccurred: (error: boolean) => void;
  retryAttempts: number;
  setRetryAttempts: (attempts: number) => void;
  setLocalTimerActive: (active: boolean) => void;
  saveSessionId: (id: string) => void;
  user: { id?: string } | null;
}

export const useTimerToggle = ({
  isTracking,
  startTime,
  setStartTime,
  currentSessionId,
  setCurrentSessionId,
  setIsTracking,
  saveTimerSession,
  clearTimerStorage,
  createSession,
  completeSession,
  locationDetails,
  hourlyRate,
  overtimeRate,
  overtimeThreshold,
  totalBreakTime,
  isLoading,
  setIsLoading,
  errorOccurred,
  setErrorOccurred,
  retryAttempts,
  setRetryAttempts,
  setLocalTimerActive,
  saveSessionId,
  user
}: UseTimerToggleProps) => {
  
  const handleToggleTimer = useCallback(async () => {
    setIsLoading(true);

    try {
      if (!isTracking) {
        // Starting the timer
        const now = new Date();
        setStartTime(now);
        setIsTracking(true);
        setLocalTimerActive(true);
        
        // Save to local storage first
        saveTimerSession(now, locationDetails);
        
        // Then create the session in the database if user is logged in
        if (user?.id) {
          console.log("Creating session for user:", user.id);
          try {
            const sessionId = await createSession(now);
            if (sessionId) {
              console.log("Session created with ID:", sessionId);
              saveSessionId(sessionId);
              setErrorOccurred(false);
              setRetryAttempts(0);
            } else {
              console.error("Failed to create session, no ID returned");
              setErrorOccurred(true);
              // Continue with local timer despite the error
              toast.error("Failed to save session to server, but local timer is running");
            }
          } catch (error) {
            console.error("Error creating session:", error);
            setErrorOccurred(true);
            // Continue with local timer despite the error
            toast.error("Failed to save session to server, but local timer is running");
          }
        } else {
          console.log("No user ID available, using local timer only");
        }
        
        toast.success("Timer started");
      } else {
        // Stopping the timer
        const now = new Date();
        
        // Complete the session in the database
        if (user?.id && currentSessionId && !errorOccurred) {
          console.log("Completing session:", currentSessionId);
          try {
            const result = await completeSession(now);
            
            if (result) {
              const { totalEarnings, overtimeEarnings } = result;
              
              toast.success(
                `Timer stopped. Earned: $${totalEarnings.toFixed(2)} ${overtimeEarnings > 0 ? `(including $${overtimeEarnings.toFixed(2)} overtime)` : ""}`
              );
            } else {
              console.error("Error completing session, no result returned");
              toast.error("Error completing session, but time has been tracked locally");
            }
          } catch (error) {
            console.error("Error stopping timer:", error);
            toast.error("Error saving to server, but time has been tracked locally");
          }
        } else {
          console.log("Using local timer only, not updating database");
          
          // Calculate earnings based on local timer
          const durationMs = now.getTime() - (startTime?.getTime() || now.getTime());
          const netDurationMs = durationMs - (totalBreakTime * 60 * 1000);
          const durationHours = netDurationMs / (1000 * 60 * 60);
          
          let regularHours = durationHours;
          let overtimeHours = 0;
          
          if (durationHours > overtimeThreshold) {
            regularHours = overtimeThreshold;
            overtimeHours = durationHours - overtimeThreshold;
          }
          
          const regularEarnings = regularHours * hourlyRate;
          const overtimeEarnings = overtimeHours * overtimeRate;
          const totalEarnings = regularEarnings + overtimeEarnings;
          
          // Save the session to localStorage for offline access
          if (startTime) {
            saveSessionToLocalStorage({
              startTime,
              endTime: now,
              earnings: totalEarnings,
              address: locationDetails?.address
            });
          }
          
          toast.success(`Timer stopped. Approximate earnings: $${totalEarnings.toFixed(2)}`);
        }
        
        // Reset state
        setStartTime(null);
        setCurrentSessionId(null);
        setIsTracking(false);
        setLocalTimerActive(false);
        setErrorOccurred(false);
        setRetryAttempts(0);
        clearTimerStorage();
      }
    } catch (error) {
      console.error("Error toggling timer:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    isTracking, 
    startTime, 
    user, 
    currentSessionId, 
    errorOccurred, 
    locationDetails, 
    hourlyRate, 
    overtimeRate, 
    overtimeThreshold, 
    totalBreakTime,
    setStartTime, 
    setIsTracking, 
    setLocalTimerActive, 
    saveTimerSession, 
    createSession, 
    saveSessionId, 
    setErrorOccurred, 
    setRetryAttempts, 
    completeSession, 
    setCurrentSessionId, 
    clearTimerStorage,
    setIsLoading
  ]);

  return {
    handleToggleTimer
  };
};
