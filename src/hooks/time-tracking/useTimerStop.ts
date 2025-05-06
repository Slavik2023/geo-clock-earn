
import { toast } from "sonner";
import { saveSessionToLocalStorage } from "@/components/time-tracker/services/sessionService";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

interface UseTimerStopProps {
  currentSessionId: string | null;
  startTime: Date | null;
  completeSession: (now: Date) => Promise<any>;
  setStartTime: (time: Date | null) => void;
  setCurrentSessionId: (id: string | null) => void;
  setIsTracking: (isTracking: boolean) => void;
  setLocalTimerActive: (active: boolean) => void;
  setErrorOccurred: (error: boolean) => void;
  setRetryAttempts: (attempts: number) => void;
  clearTimerStorage: () => void;
  locationDetails: LocationDetails | null;
  hourlyRate: number;
  overtimeRate: number;
  overtimeThreshold: number;
  totalBreakTime: number;
  errorOccurred: boolean;
  user: { id?: string } | null;
}

export const useTimerStop = ({
  currentSessionId,
  startTime,
  completeSession,
  setStartTime,
  setCurrentSessionId,
  setIsTracking,
  setLocalTimerActive,
  setErrorOccurred,
  setRetryAttempts,
  clearTimerStorage,
  locationDetails,
  hourlyRate,
  overtimeRate,
  overtimeThreshold,
  totalBreakTime,
  errorOccurred,
  user
}: UseTimerStopProps) => {
  
  const stopTimer = async (now: Date) => {
    // Complete the session in the database
    if (user?.id && currentSessionId && !errorOccurred) {
      console.log("Completing session:", currentSessionId);
      try {
        const result = await completeSession(now);
        
        if (result) {
          const { totalEarnings, overtimeEarnings } = result;
          
          toast.success(
            `Timer stopped. Earned: $${totalEarnings.toFixed(2)} ${overtimeEarnings > 0 ? `(including $${overtimeEarnings.toFixed(2)} overtime)` : ""}`
          );
        } else {
          console.error("Error completing session, no result returned");
          toast.error("Error completing session, but time has been tracked locally");
        }
      } catch (error) {
        console.error("Error stopping timer:", error);
        toast.error("Error saving to server, but time has been tracked locally");
      }
    } else {
      console.log("Using local timer only, not updating database");
      
      // Calculate earnings based on local timer
      const durationMs = now.getTime() - (startTime?.getTime() || now.getTime());
      const netDurationMs = durationMs - (totalBreakTime * 60 * 1000);
      const durationHours = netDurationMs / (1000 * 60 * 60);
      
      let regularHours = durationHours;
      let overtimeHours = 0;
      
      if (durationHours > overtimeThreshold) {
        regularHours = overtimeThreshold;
        overtimeHours = durationHours - overtimeThreshold;
      }
      
      const regularEarnings = regularHours * hourlyRate;
      const overtimeEarnings = overtimeHours * overtimeRate;
      const totalEarnings = regularEarnings + overtimeEarnings;
      
      // Save the session to localStorage for offline access
      if (startTime) {
        saveSessionToLocalStorage({
          startTime,
          endTime: now,
          earnings: totalEarnings,
          address: locationDetails?.address
        });
      }
      
      toast.success(`Timer stopped. Approximate earnings: $${totalEarnings.toFixed(2)}`);
    }
    
    // Reset state
    setStartTime(null);
    setCurrentSessionId(null);
    setIsTracking(false);
    setLocalTimerActive(false);
    setErrorOccurred(false);
    setRetryAttempts(0);
    clearTimerStorage();
  };

  return { stopTimer };
};
