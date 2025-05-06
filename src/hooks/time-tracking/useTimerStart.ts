
import { useCallback } from "react";
import { toast } from "sonner";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

interface UseTimerStartProps {
  setStartTime: (time: Date | null) => void;
  setIsTracking: (isTracking: boolean) => void;
  locationDetails: LocationDetails | null;
  saveTimerSession: (now: Date, locationDetails: LocationDetails | null) => void;
  createSession: (now: Date) => Promise<string | null>;
  saveSessionId: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
  setErrorOccurred: (error: boolean) => void;
  setLocalTimerActive: (active: boolean) => void;
  user: { id?: string } | null;
}

export const useTimerStart = ({
  setStartTime,
  setIsTracking,
  locationDetails,
  saveTimerSession,
  createSession,
  saveSessionId,
  setIsLoading,
  setErrorOccurred,
  setLocalTimerActive,
  user
}: UseTimerStartProps) => {
  const startTimer = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const now = new Date();
      
      // Set UI state
      setStartTime(now);
      setIsTracking(true);
      setLocalTimerActive(true);
      
      // Save session locally regardless of server status
      saveTimerSession(now, locationDetails);
      
      // Attempt to create session in database if user is logged in
      if (user?.id) {
        try {
          const sessionId = await createSession(now);
          
          if (sessionId) {
            console.log("Session created with ID:", sessionId);
            saveSessionId(sessionId);
            setErrorOccurred(false);
          } else {
            console.error("Failed to create session (no ID returned)");
            setErrorOccurred(true);
          }
        } catch (error) {
          console.error("Error creating session:", error);
          setErrorOccurred(true);
          toast.error("Failed to save session to server. Your time will still be tracked locally.");
        }
      }
      
      toast.success("Started tracking your time");
      
    } catch (error) {
      console.error("Error starting timer:", error);
      toast.error("An error occurred while starting the timer");
    } finally {
      setIsLoading(false);
    }
  }, [
    setStartTime, 
    setIsTracking, 
    locationDetails, 
    saveTimerSession, 
    createSession, 
    saveSessionId, 
    setIsLoading, 
    setErrorOccurred,
    setLocalTimerActive,
    user
  ]);

  return { startTimer };
};
