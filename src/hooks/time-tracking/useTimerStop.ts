
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
  setIsLoading: (loading: boolean) => void;
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
  user,
  setIsLoading
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
          
          // Always save to local storage as backup even when database save succeeds
          if (startTime) {
            saveSessionToLocalStorage({
              startTime,
              endTime: now,
              earnings: totalEarnings,
              address: locationDetails?.address,
              hourlyRate: hourlyRate
            });
          }
        } else {
          console.error("Error completing session, no result returned");
          toast.error("Error completing session, but time has been tracked locally");
          
          // Save local backup since database save failed
          if (startTime) {
            const earnings = calculateLocalEarnings(startTime, now, totalBreakTime, hourlyRate, overtimeRate, overtimeThreshold);
            saveSessionToLocalStorage({
              startTime,
              endTime: now,
              earnings: earnings.totalEarnings,
              address: locationDetails?.address,
              hourlyRate: hourlyRate
            });
          }
        }
      } catch (error) {
        console.error("Error stopping timer:", error);
        toast.error("Error saving to server, but time has been tracked locally");
        
        // Save local backup since database save failed
        if (startTime) {
          const earnings = calculateLocalEarnings(startTime, now, totalBreakTime, hourlyRate, overtimeRate, overtimeThreshold);
          saveSessionToLocalStorage({
            startTime,
            endTime: now,
            earnings: earnings.totalEarnings,
            address: locationDetails?.address,
            hourlyRate: hourlyRate
          });
        }
      }
    } else {
      console.log("Using local timer only, not updating database");
      
      // Calculate earnings based on local timer
      const earnings = calculateLocalEarnings(startTime, now, totalBreakTime, hourlyRate, overtimeRate, overtimeThreshold);
      
      // Save the session to localStorage for offline access
      if (startTime) {
        saveSessionToLocalStorage({
          startTime,
          endTime: now,
          earnings: earnings.totalEarnings,
          address: locationDetails?.address,
          hourlyRate: hourlyRate
        });
      }
      
      toast.success(`Timer stopped. Approximate earnings: $${earnings.totalEarnings.toFixed(2)}`);
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
  
  // Helper function to calculate earnings locally
  const calculateLocalEarnings = (
    startTime: Date | null, 
    endTime: Date, 
    breakTimeMinutes: number, 
    hourlyRate: number, 
    overtimeRate: number,
    overtimeThreshold: number
  ) => {
    if (!startTime) return { totalEarnings: 0, overtimeEarnings: 0 };
    
    const durationMs = endTime.getTime() - startTime.getTime();
    const netDurationMs = durationMs - (breakTimeMinutes * 60 * 1000);
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
    
    return { totalEarnings, overtimeEarnings };
  };

  return { stopTimer };
};
