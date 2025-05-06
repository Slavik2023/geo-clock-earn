
import { useAuth } from "@/App";
import { useTimerStorage } from "./useTimerStorage";
import { useSessionManagement } from "./useSessionManagement";
import { useLunchBreak } from "./useLunchBreak";
import { useUserRates } from "./useUserRates";
import { useTimeTrackingState } from "./useTimeTrackingState";
import { useLocationTracking } from "./useLocationTracking";
import { useTimeTrackingActions } from "./useTimeTrackingActions";

interface UseTimeTrackingProps {
  isLocationVerified: boolean;
}

export const useTimeTracking = ({ isLocationVerified }: UseTimeTrackingProps) => {
  const { user } = useAuth();
  
  // State management
  const {
    isLoading,
    setIsLoading,
    locationDetails,
    setLocationDetails,
    localTimerActive,
    setLocalTimerActive,
    errorOccurred,
    setErrorOccurred,
    retryAttempts,
    setRetryAttempts
  } = useTimeTrackingState();
  
  // Timer storage
  const {
    startTime,
    setStartTime,
    currentSessionId,
    setCurrentSessionId,
    isTracking,
    setIsTracking,
    saveTimerSession,
    saveSessionId,
    clearTimerStorage
  } = useTimerStorage();

  // User rates
  const { hourlyRate, overtimeRate, overtimeThreshold } = useUserRates(user?.id);

  // Lunch break
  const { 
    totalBreakTime,
    lunchBreakActive,
    startLunchBreak
  } = useLunchBreak({ isTracking });

  // Session management
  const {
    createSession,
    completeSession
  } = useSessionManagement({
    userId: user?.id || null,
    locationDetails,
    hourlyRate,
    overtimeRate,
    overtimeThreshold,
    totalBreakTime,
    startTime,
    currentSessionId
  });

  // Location tracking
  const {
    handleLocationVerified
  } = useLocationTracking(setLocationDetails);

  // Actions
  const {
    handleToggleTimer
  } = useTimeTrackingActions({
    isTracking,
    startTime,
    setStartTime,
    currentSessionId,
    setCurrentSessionId,
    setIsTracking,
    saveTimerSession,
    saveSessionId,
    clearTimerStorage,
    createSession,
    completeSession,
    locationDetails,
    hourlyRate,
    overtimeRate,
    overtimeThreshold,
    totalBreakTime,
    isLoading,
    setIsLoading,
    errorOccurred,
    setErrorOccurred,
    retryAttempts,
    setRetryAttempts,
    setLocalTimerActive
  });

  return {
    isTracking,
    startTime,
    isLoading,
    hourlyRate,
    overtimeRate,
    overtimeThreshold,
    locationDetails,
    errorOccurred,
    handleLocationVerified,
    handleToggleTimer,
    lunchBreakActive,
    startLunchBreak,
    totalBreakTime
  };
};
