
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

export interface UseTimeTrackingProps {
  isLocationVerified: boolean;
}

export interface TimeTrackingState {
  isTracking: boolean;
  startTime: Date | null;
  endTime: Date | null;
  isLoading: boolean;
  hourlyRate: number;
  overtimeRate: number;
  overtimeThreshold: number;
  locationDetails: LocationDetails | null;
  currentSessionId: string | null;
  userId: string | null;
  lunchBreakActive: boolean;
  lunchBreakStart: Date | null;
  lunchBreakDuration: number;
  totalBreakTime: number;
}

export interface TimeTrackingActions {
  handleLocationVerified: (verified: boolean, details?: LocationDetails) => void;
  handleToggleTimer: () => Promise<void>;
  startLunchBreak: (duration: number) => void;
  endLunchBreak: () => void;
}
