
import { useEffect } from "react";
import { toast } from "sonner";

interface UseAutoRetryProps {
  errorOccurred: boolean;
  isTracking: boolean;
  retryAttempts: number;
  setRetryAttempts: (attempts: number) => void;
  setErrorOccurred: (error: boolean) => void;
  startTime: Date | null;
  user: { id?: string } | null;
  createSession: (now: Date) => Promise<string | null>;
  saveSessionId: (id: string) => void;
  maxRetryAttempts: number;
  errorMessage?: string;
  setErrorMessage?: (message: string) => void;
}

export const useAutoRetry = ({
  errorOccurred,
  isTracking,
  retryAttempts,
  setRetryAttempts,
  setErrorOccurred,
  startTime,
  user,
  createSession,
  saveSessionId,
  maxRetryAttempts,
  setErrorMessage
}: UseAutoRetryProps) => {
  // Automatic retry logic for failed session creation
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    
    if (errorOccurred && isTracking && user?.id && retryAttempts < maxRetryAttempts) {
      console.log(`Retrying session creation, attempt ${retryAttempts + 1}/${maxRetryAttempts}`);
      
      retryTimeout = setTimeout(async () => {
        try {
          if (!startTime) return;
          
          const sessionId = await createSession(startTime);
          if (sessionId) {
            console.log("Retry successful, session created with ID:", sessionId);
            saveSessionId(sessionId);
            setErrorOccurred(false);
            setRetryAttempts(0);
            if (setErrorMessage) {
              setErrorMessage("");
            }
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
  }, [errorOccurred, isTracking, retryAttempts, user?.id, startTime, createSession, saveSessionId, setErrorOccurred, setRetryAttempts, maxRetryAttempts, setErrorMessage]);
};
