
import { useAuth } from "@/App";
import { useTimerStorage } from "./useTimerStorage";
import { useSessionManagement } from "./useSessionManagement";
import { useLunchBreak } from "./useLunchBreak";
import { useUserRates } from "./useUserRates";
import { useTimeTrackingState } from "./useTimeTrackingState";
import { useLocationTracking } from "./useLocationTracking";
import { useTimeTrackingActions } from "./useTimeTrackingActions";
import { useTimerErrorHandler } from "./useTimerErrorHandler";

interface UseTimeTrackingProps {
  isLocationVerified: boolean;
}

export const useTimeTracking = ({ isLocationVerified }: UseTimeTrackingProps) => {
  const { user } = useAuth();
  const { handleError } = useTimerErrorHandler();
  
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
    errorMessage,
    setErrorMessage,
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
    currentSessionId,
    setErrorMessage
  });

  // Location tracking
  const {
    handleLocationVerified
  } = useLocationTracking(setLocationDetails);

  // Actions
  const {
    handleToggleTimer,
    retryConnection,
    MAX_RETRY_ATTEMPTS
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
    errorMessage,
    setErrorMessage,
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
    errorMessage,
    handleLocationVerified,
    handleToggleTimer,
    lunchBreakActive,
    startLunchBreak,
    totalBreakTime,
    retryConnection,
    retryAttempts,
    MAX_RETRY_ATTEMPTS,
    handleError
  };
};
