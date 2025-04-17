
import { useState } from "react";
import { Clock } from "@/components/time-tracker/Clock";
import { TimerButton } from "@/components/time-tracker/TimerButton";
import { EnhancedLocationCheck } from "@/components/time-tracker/EnhancedLocationCheck";
import { EarningsCard } from "@/components/time-tracker/EarningsCard";
import { CurrentLocationCard } from "@/components/time-tracker/CurrentLocationCard";
import { useTimeTracking } from "@/hooks/useTimeTracking";

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
    handleToggleTimer
  } = useTimeTracking({ isLocationVerified });

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
      
      <TimerButton 
        isActive={isTracking} 
        onToggle={handleToggleTimer} 
        isLoading={isLoading}
        disabled={!isLocationVerified && !isTracking}
      />
      
      <div className="w-full max-w-md mt-4">
        <EarningsCard 
          hourlyRate={hourlyRate}
          overtimeRate={overtimeRate}
          startTime={startTime}
          isActive={isTracking}
          overtimeThresholdHours={overtimeThreshold}
        />
      </div>
    </div>
  );
}
