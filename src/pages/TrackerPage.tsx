
import { useState, useEffect, useCallback } from "react";
import { Clock } from "@/components/time-tracker/Clock";
import { TimerButton } from "@/components/time-tracker/TimerButton";
import { EnhancedLocationCheck } from "@/components/time-tracker/EnhancedLocationCheck";
import { EarningsCard } from "@/components/time-tracker/EarningsCard";
import { CurrentLocationCard } from "@/components/time-tracker/CurrentLocationCard";
import { useTimeTracking } from "@/hooks/time-tracking";
import { LunchBreakButton } from "@/components/time-tracker/LunchBreakButton";
import { toast } from "sonner";
import { ConnectionErrorBanner } from "@/components/time-tracker/ConnectionErrorBanner";

export function TrackerPage() {
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const {
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
    totalBreakTime,
    retryConnection,
    retryAttempts,
    MAX_RETRY_ATTEMPTS
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

  const handleRetryConnection = useCallback(() => {
    setIsRetrying(true);
    retryConnection().finally(() => {
      setTimeout(() => setIsRetrying(false), 1000);
    });
  }, [retryConnection]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {errorOccurred && isTracking && (
        <div className="w-full max-w-md">
          <ConnectionErrorBanner 
            message="Error saving session to server. Your time will be tracked locally until connection is restored."
            onRetry={handleRetryConnection}
            variant="warning"
          />
        </div>
      )}
      
      {isRetrying && (
        <div className="w-full max-w-md">
          <ConnectionErrorBanner 
            message="Retrying connection to server..."
            showRetry={false}
            variant="info"
          />
        </div>
      )}
      
      {errorOccurred && isTracking && retryAttempts >= MAX_RETRY_ATTEMPTS && (
        <div className="w-full max-w-md">
          <ConnectionErrorBanner 
            message="Connection failed. Your time will continue to be tracked locally."
            onRetry={handleRetryConnection}
            variant="error"
          />
        </div>
      )}
      
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
          hasError={errorOccurred}
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
          hasError={errorOccurred}
          onRetryConnection={handleRetryConnection}
        />
      </div>
    </div>
  );
}
