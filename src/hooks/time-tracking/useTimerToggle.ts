
import { useCallback } from "react";
import { useTimerStart } from "./useTimerStart";
import { useTimerStop } from "./useTimerStop";
import { useTimerErrorHandler } from "./useTimerErrorHandler";
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

export const useTimerToggle = (props: UseTimerToggleProps) => {
  const {
    isTracking,
    setIsLoading,
    errorOccurred
  } = props;
  
  // Use the specialized hooks
  const { startTimer } = useTimerStart(props);
  const { stopTimer } = useTimerStop(props);
  const { handleError } = useTimerErrorHandler();

  const handleToggleTimer = useCallback(async () => {
    setIsLoading(true);

    try {
      const now = new Date();
      
      if (!isTracking) {
        // Starting the timer
        await startTimer(now);
      } else {
        // Stopping the timer
        await stopTimer(now);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    isTracking,
    startTimer,
    stopTimer,
    handleError,
    setIsLoading
  ]);

  return {
    handleToggleTimer
  };
};
