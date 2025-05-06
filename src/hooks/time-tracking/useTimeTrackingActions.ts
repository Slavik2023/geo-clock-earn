
import { useAuth } from "@/App";
import { useConnectionRetry } from "./useConnectionRetry";
import { useTimerToggle } from "./useTimerToggle";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

interface UseTimeTrackingActionsProps {
  isTracking: boolean;
  startTime: Date | null;
  setStartTime: (time: Date | null) => void;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  setIsTracking: (isTracking: boolean) => void;
  saveTimerSession: (now: Date, locationDetails: LocationDetails | null) => void;
  saveSessionId: (id: string) => void;
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
}

export const useTimeTrackingActions = (props: UseTimeTrackingActionsProps) => {
  const { user } = useAuth();
  
  // Use connection retry hook
  const { retryConnection, MAX_RETRY_ATTEMPTS } = useConnectionRetry({
    errorOccurred: props.errorOccurred,
    isTracking: props.isTracking,
    retryAttempts: props.retryAttempts,
    setRetryAttempts: props.setRetryAttempts,
    setErrorOccurred: props.setErrorOccurred,
    startTime: props.startTime,
    user,
    createSession: props.createSession,
    saveSessionId: props.saveSessionId
  });
  
  // Use timer toggle hook
  const { handleToggleTimer } = useTimerToggle({
    ...props,
    user
  });

  return {
    handleToggleTimer,
    retryConnection,
    retryAttempts: props.retryAttempts,
    MAX_RETRY_ATTEMPTS
  };
};
