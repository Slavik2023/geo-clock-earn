
import { useSessionCreation } from "./useSessionCreation";
import { useSessionCompletion } from "./useSessionCompletion";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

interface UseSessionManagementProps {
  userId: string | null;
  locationDetails: LocationDetails | null;
  hourlyRate: number;
  overtimeRate: number;
  overtimeThreshold: number;
  totalBreakTime: number;
  startTime: Date | null;
  currentSessionId: string | null;
  setErrorMessage?: (message: string) => void;
}

export function useSessionManagement({
  userId,
  locationDetails,
  hourlyRate,
  overtimeRate,
  overtimeThreshold,
  totalBreakTime,
  startTime,
  currentSessionId,
  setErrorMessage
}: UseSessionManagementProps) {
  // Session creation
  const { createSession } = useSessionCreation({
    userId,
    locationDetails,
    hourlyRate,
    setErrorMessage
  });

  // Session completion
  const { 
    endTime, 
    setEndTime, 
    completeSession 
  } = useSessionCompletion({
    userId,
    currentSessionId,
    startTime,
    hourlyRate,
    overtimeRate,
    overtimeThreshold,
    totalBreakTime,
    setErrorMessage
  });

  return {
    endTime,
    setEndTime,
    createSession,
    completeSession
  };
}
