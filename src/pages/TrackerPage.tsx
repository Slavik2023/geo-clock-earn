
import { useState, useEffect } from "react";
import { Clock } from "@/components/time-tracker/Clock";
import { TimerButton } from "@/components/time-tracker/TimerButton";
import { LocationCheck } from "@/components/time-tracker/LocationCheck";
import { EarningsCard } from "@/components/time-tracker/EarningsCard";
import { useToast } from "@/components/ui/use-toast";

export function TrackerPage() {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [overtimeRate, setOvertimeRate] = useState(37.5);

  useEffect(() => {
    // Check if there's an active timer in localStorage
    const activeTimerStart = localStorage.getItem("activeTimerStart");
    if (activeTimerStart) {
      setStartTime(new Date(activeTimerStart));
      setIsTracking(true);
    }
    
    // In a real app, hourly rate would be fetched from user settings
    // For demo purposes, we'll use hardcoded values
  }, []);

  const handleLocationVerified = (verified: boolean) => {
    setIsLocationVerified(verified);
    if (!verified) {
      toast({
        variant: "destructive",
        title: "Location Not Verified",
        description: "Please enable location services to use time tracking."
      });
    }
  };

  const handleToggleTimer = async () => {
    if (!isLocationVerified) {
      toast({
        variant: "destructive",
        title: "Location Required",
        description: "Your location must be verified before tracking time."
      });
      return;
    }

    setIsLoading(true);

    if (!isTracking) {
      // Start tracking
      try {
        const now = new Date();
        setStartTime(now);
        setIsTracking(true);
        localStorage.setItem("activeTimerStart", now.toISOString());
        
        toast({
          title: "Time Tracking Started",
          description: `Started at ${now.toLocaleTimeString()}`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Starting Timer",
          description: "There was an error starting the timer."
        });
      }
    } else {
      // Stop tracking
      try {
        const now = new Date();
        setEndTime(now);
        setIsTracking(false);
        
        // Calculate duration and earnings
        if (startTime) {
          const durationMs = now.getTime() - startTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          const earnings = durationHours * hourlyRate;
          
          // In a real app, you would save this session to a database or local storage
          // For demo purposes, we'll just show a toast
          toast({
            title: "Time Tracking Stopped",
            description: `You earned $${earnings.toFixed(2)} for this session.`,
          });
          
          // Clear the active timer
          localStorage.removeItem("activeTimerStart");
          
          // After a short delay, reset the start time
          setTimeout(() => {
            setStartTime(null);
          }, 3000);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Stopping Timer",
          description: "There was an error stopping the timer."
        });
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <Clock />
      
      <div className="w-full max-w-md">
        <LocationCheck onLocationVerified={handleLocationVerified} />
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
        />
      </div>
    </div>
  );
}
