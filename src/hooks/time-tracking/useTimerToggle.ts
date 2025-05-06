
import { useCallback } from "react";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";
import { useTimerStart } from "./useTimerStart";
import { useTimerStop } from "./useTimerStop";

interface UseTimerToggleProps {
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
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorOccurred: boolean;
  setErrorOccurred: (error: boolean) => void;
  setLocalTimerActive: (active: boolean) => void;
  user: { id?: string } | null;
}

export const useTimerToggle = (props: UseTimerToggleProps) => {
  // Use timer start hook
  const { startTimer } = useTimerStart({
    setStartTime: props.setStartTime,
    setIsTracking: props.setIsTracking,
    locationDetails: props.locationDetails,
    saveTimerSession: props.saveTimerSession,
    createSession: props.createSession,
    saveSessionId: props.saveSessionId,
    setIsLoading: props.setIsLoading,
    setErrorOccurred: props.setErrorOccurred,
    setLocalTimerActive: props.setLocalTimerActive,
    user: props.user
  });
  
  // Use timer stop hook
  const { stopTimer } = useTimerStop({
    startTime: props.startTime,
    setStartTime: props.setStartTime,
    setIsTracking: props.setIsTracking,
    currentSessionId: props.currentSessionId,
    setCurrentSessionId: props.setCurrentSessionId,
    clearTimerStorage: props.clearTimerStorage,
    completeSession: props.completeSession,
    setIsLoading: props.setIsLoading,
    setLocalTimerActive: props.setLocalTimerActive
  });
  
  // Timer toggle handler
  const handleToggleTimer = useCallback(async () => {
    if (props.isLoading) return;
    
    if (props.isTracking) {
      await stopTimer();
    } else {
      await startTimer();
    }
  }, [
    props.isTracking, 
    props.isLoading, 
    startTimer, 
    stopTimer
  ]);

  return { handleToggleTimer };
};
