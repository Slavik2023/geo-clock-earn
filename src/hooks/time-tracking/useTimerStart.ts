
import { toast } from "sonner";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

interface UseTimerStartProps {
  setStartTime: (time: Date | null) => void;
  setIsTracking: (isTracking: boolean) => void;
  setLocalTimerActive: (active: boolean) => void;
  saveTimerSession: (now: Date, locationDetails: LocationDetails | null) => void;
  createSession: (now: Date) => Promise<string | null>;
  saveSessionId: (id: string) => void;
  setErrorOccurred: (error: boolean) => void;
  setRetryAttempts: (attempts: number) => void;
  locationDetails: LocationDetails | null;
  user: { id?: string } | null;
}

export const useTimerStart = ({
  setStartTime,
  setIsTracking,
  setLocalTimerActive,
  saveTimerSession,
  createSession,
  saveSessionId,
  setErrorOccurred,
  setRetryAttempts,
  locationDetails,
  user
}: UseTimerStartProps) => {
  
  const startTimer = async (now: Date) => {
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
          toast.error("Error saving session to server, local timer will continue");
        }
      } catch (error) {
        console.error("Error creating session:", error);
        setErrorOccurred(true);
        // Continue with local timer despite the error
        toast.error("Failed to save session to server, local timer is running");
      }
    } else {
      console.log("No user ID available, using local timer only");
    }
    
    toast.success("Timer started");
  };

  return { startTimer };
};
