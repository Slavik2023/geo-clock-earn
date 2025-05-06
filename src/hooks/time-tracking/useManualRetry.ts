
import { useCallback } from "react";
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
  // Manual retry function
  const retryConnection = useCallback(async () => {
    if (!isTracking || !user?.id || !startTime) return;
    
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
        toast.error("Connection failed. Your time will continue to be tracked locally.");
      }
    } catch (error) {
      console.error("Error during manual retry:", error);
      toast.error("Connection failed. Your time will continue to be tracked locally.");
    }
  }, [isTracking, user?.id, startTime, createSession, saveSessionId, setErrorOccurred, setRetryAttempts, setErrorMessage]);

  return { retryConnection };
};
