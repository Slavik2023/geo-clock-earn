
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface UseLunchBreakProps {
  isTracking: boolean;
}

export function useLunchBreak({ isTracking }: UseLunchBreakProps) {
  const { toast } = useToast();
  const [lunchBreakActive, setLunchBreakActive] = useState(false);
  const [lunchBreakStart, setLunchBreakStart] = useState<Date | null>(null);
  const [lunchBreakDuration, setLunchBreakDuration] = useState(0); // in minutes
  const [totalBreakTime, setTotalBreakTime] = useState(0); // in minutes
  
  // Load existing break time from localStorage
  useEffect(() => {
    const activeLunchBreakTotal = localStorage.getItem("activeLunchBreakTotal");
    if (activeLunchBreakTotal) {
      setTotalBreakTime(parseInt(activeLunchBreakTotal));
    }
  }, []);

  // Handle lunch breaks
  useEffect(() => {
    if (lunchBreakActive && lunchBreakStart) {
      const breakTimer = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - lunchBreakStart.getTime()) / (1000 * 60));
        
        if (elapsed >= lunchBreakDuration) {
          endLunchBreak();
        }
      }, 1000);
      
      return () => clearInterval(breakTimer);
    }
  }, [lunchBreakActive, lunchBreakStart, lunchBreakDuration]);

  const startLunchBreak = (duration: number) => {
    if (!isTracking) return;
    
    setLunchBreakActive(true);
    setLunchBreakStart(new Date());
    setLunchBreakDuration(duration);
    
    toast({
      title: "Lunch Break Started",
      description: `${duration} minute break started. Timer will be adjusted automatically.`,
    });
  };

  const endLunchBreak = () => {
    if (!lunchBreakStart) return;
    
    const now = new Date();
    const breakDurationMinutes = Math.floor((now.getTime() - lunchBreakStart.getTime()) / (1000 * 60));
    const newTotalBreakTime = totalBreakTime + breakDurationMinutes;
    
    setTotalBreakTime(newTotalBreakTime);
    setLunchBreakActive(false);
    setLunchBreakStart(null);
    
    // Update in localStorage
    localStorage.setItem("activeLunchBreakTotal", newTotalBreakTime.toString());
    
    toast({
      title: "Lunch Break Ended",
      description: `${breakDurationMinutes} minute break has been recorded.`,
    });
  };

  const resetBreakTime = () => {
    setTotalBreakTime(0);
    localStorage.removeItem("activeLunchBreakTotal");
  };

  return {
    lunchBreakActive,
    lunchBreakStart,
    lunchBreakDuration,
    totalBreakTime,
    startLunchBreak,
    endLunchBreak,
    resetBreakTime
  };
}
