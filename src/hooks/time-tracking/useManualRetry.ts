
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseManualRetryProps {
  isTracking: boolean;
  user: { id?: string } | null;
  startTime: Date | null;
  createSession: (now: Date) => Promise<string | null>;
  saveSessionId: (id: string) => void;
  setErrorOccurred: (error: boolean) => void;
  setRetryAttempts: (attempts: number) => void;
  errorMessage?: string;
  setErrorMessage?: (message: string) => void;
}

export const useManualRetry = ({
  isTracking,
  user,
  startTime,
  createSession,
  saveSessionId,
  setErrorOccurred,
  setRetryAttempts,
  setErrorMessage
}: UseManualRetryProps) => {
  const [isPerformingRetry, setIsPerformingRetry] = useState(false);
  
  // Manual retry function with improved error handling
  const retryConnection = useCallback(async () => {
    if (!isTracking || !user?.id || !startTime) return;
    
    setIsPerformingRetry(true);
    toast.info("Retrying connection to server...");
    
    try {
      const sessionId = await createSession(startTime);
      if (sessionId) {
        console.log("Manual retry successful, session created with ID:", sessionId);
        saveSessionId(sessionId);
        setErrorOccurred(false);
        setRetryAttempts(0);
        if (setErrorMessage) {
          setErrorMessage("");
        }
        toast.success("Connected to server and saved session");
      } else {
        console.error("Manual retry failed, no session ID returned");
        
        // Show appropriate error message based on most recent error
        toast.error("Connection failed. Your time will continue to be tracked locally.");
      }
    } catch (error) {
      console.error("Error during manual retry:", error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("recursion") || error.message.includes("team_members")) {
          if (setErrorMessage) {
            setErrorMessage("Database policy error. Your time will continue to be tracked locally.");
          }
          toast.error("Database policy error detected. Contact administrator if this persists.");
        } else {
          toast.error("Connection failed. Your time will continue to be tracked locally.");
        }
      }
    } finally {
      setIsPerformingRetry(false);
    }
  }, [isTracking, user?.id, startTime, createSession, saveSessionId, setErrorOccurred, setRetryAttempts, setErrorMessage]);

  return { retryConnection, isPerformingRetry };
};
