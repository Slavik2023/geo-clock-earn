
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
  // Automatic retry logic for failed session creation with improved backoff
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    
    if (errorOccurred && isTracking && user?.id && retryAttempts < maxRetryAttempts) {
      console.log(`Auto-retrying session creation, attempt ${retryAttempts + 1}/${maxRetryAttempts}`);
      
      // Exponential backoff: 15s, 30s, 45s
      const backoffTime = 15000 * (retryAttempts + 1);
      
      retryTimeout = setTimeout(async () => {
        try {
          if (!startTime) return;
          
          console.log(`Executing retry attempt ${retryAttempts + 1}...`);
          const sessionId = await createSession(startTime);
          
          if (sessionId) {
            console.log("Auto-retry successful, session created with ID:", sessionId);
            saveSessionId(sessionId);
            setErrorOccurred(false);
            setRetryAttempts(0);
            if (setErrorMessage) {
              setErrorMessage("");
            }
            toast.success("Connected to server and saved session");
          } else {
            console.error("Auto-retry failed, no session ID returned");
            setRetryAttempts(retryAttempts + 1);
            
            // Only show toast for the final retry attempt
            if (retryAttempts + 1 >= maxRetryAttempts) {
              toast.error("Automatic connection attempts failed. You can try manually or continue with local tracking.");
            }
          }
        } catch (error) {
          console.error("Error during auto-retry:", error);
          setRetryAttempts(retryAttempts + 1);
          
          // Handle specific error cases in the final retry attempt
          if (retryAttempts + 1 >= maxRetryAttempts) {
            if (error instanceof Error) {
              if (error.message.includes("recursion") || error.message.includes("team_members")) {
                if (setErrorMessage) {
                  setErrorMessage("Database policy error. Your time will continue to be tracked locally.");
                }
              }
            }
          }
        }
      }, backoffTime);
    }
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [errorOccurred, isTracking, retryAttempts, user?.id, startTime, createSession, saveSessionId, setErrorOccurred, setRetryAttempts, maxRetryAttempts, setErrorMessage]);
};
