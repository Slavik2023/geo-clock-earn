
import { useState, useEffect } from "react";
import { Clock } from "@/components/time-tracker/Clock";
import { TimerButton } from "@/components/time-tracker/TimerButton";
import { EnhancedLocationCheck } from "@/components/time-tracker/EnhancedLocationCheck";
import { EarningsCard } from "@/components/time-tracker/EarningsCard";
import { CurrentLocationCard } from "@/components/time-tracker/CurrentLocationCard";
import { useTimeTracking } from "@/hooks/time-tracking";
import { LunchBreakButton } from "@/components/time-tracker/LunchBreakButton";
import { toast } from "sonner";

export function TrackerPage() {
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  
  const {
    isTracking,
    startTime,
    isLoading,
    hourlyRate,
    overtimeRate,
    overtimeThreshold,
    locationDetails,
    handleLocationVerified,
    handleToggleTimer,
    lunchBreakActive,
    startLunchBreak,
    totalBreakTime
  } = useTimeTracking({ isLocationVerified });

  // Automatically verify location if one is detected
  useEffect(() => {
    if (locationDetails && !isLocationVerified) {
      setIsLocationVerified(true);
      toast.success("Location detected");
    }
  }, [locationDetails, isLocationVerified]);

  const onLocationVerified = (verified: boolean, details?: any) => {
    setIsLocationVerified(verified);
    handleLocationVerified(verified, details);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <Clock />
      
      <div className="w-full max-w-md">
        {isTracking ? (
          <CurrentLocationCard 
            locationDetails={locationDetails}
            overtimeRate={overtimeRate}
            overtimeThreshold={overtimeThreshold}
          />
        ) : (
          <EnhancedLocationCheck onLocationVerified={onLocationVerified} />
        )}
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <TimerButton 
          isActive={isTracking} 
          onToggle={handleToggleTimer} 
          isLoading={isLoading}
          disabled={!isLocationVerified && !isTracking}
        />
        
        <LunchBreakButton 
          onBreakStart={startLunchBreak}
          isTimerRunning={isTracking}
          disabled={lunchBreakActive}
        />
      </div>
      
      <div className="w-full max-w-md mt-4">
        <EarningsCard 
          hourlyRate={hourlyRate}
          overtimeRate={overtimeRate}
          startTime={startTime}
          isActive={isTracking}
          overtimeThresholdHours={overtimeThreshold}
          totalBreakTime={totalBreakTime}
        />
      </div>
    </div>
  );
}
