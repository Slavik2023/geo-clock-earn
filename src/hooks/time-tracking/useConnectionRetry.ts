
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UseConnectionRetryProps {
  errorOccurred: boolean;
  isTracking: boolean;
  retryAttempts: number;
  setRetryAttempts: (attempts: number) => void;
  setErrorOccurred: (error: boolean) => void;
  startTime: Date | null;
  user: { id?: string } | null;
  createSession: (now: Date) => Promise<string | null>;
  saveSessionId: (id: string) => void;
}

export const useConnectionRetry = ({
  errorOccurred,
  isTracking,
  retryAttempts,
  setRetryAttempts,
  setErrorOccurred,
  startTime,
  user,
  createSession,
  saveSessionId
}: UseConnectionRetryProps) => {
  const MAX_RETRY_ATTEMPTS = 3;

  // Automatic retry logic for failed session creation
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    
    if (errorOccurred && isTracking && user?.id && retryAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`Retrying session creation, attempt ${retryAttempts + 1}/${MAX_RETRY_ATTEMPTS}`);
      
      retryTimeout = setTimeout(async () => {
        try {
          if (!startTime) return;
          
          const sessionId = await createSession(startTime);
          if (sessionId) {
            console.log("Retry successful, session created with ID:", sessionId);
            saveSessionId(sessionId);
            setErrorOccurred(false);
            setRetryAttempts(0);
            toast.success("Connected to server and saved session");
          } else {
            console.error("Retry failed, no session ID returned");
            setRetryAttempts(retryAttempts + 1);
          }
        } catch (error) {
          console.error("Error during retry:", error);
          setRetryAttempts(retryAttempts + 1);
        }
      }, 15000 * (retryAttempts + 1)); // Increasing backoff: 15s, 30s, 45s
    }
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [errorOccurred, isTracking, retryAttempts, user?.id, startTime, createSession, saveSessionId, setErrorOccurred, setRetryAttempts, MAX_RETRY_ATTEMPTS]);

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
        toast.success("Connected to server and saved session");
      } else {
        console.error("Manual retry failed, no session ID returned");
        toast.error("Connection failed. Your time will continue to be tracked locally.");
      }
    } catch (error) {
      console.error("Error during manual retry:", error);
      toast.error("Connection failed. Your time will continue to be tracked locally.");
    }
  }, [isTracking, user?.id, startTime, createSession, saveSessionId, setErrorOccurred, setRetryAttempts]);

  return {
    retryConnection,
    MAX_RETRY_ATTEMPTS
  };
};
