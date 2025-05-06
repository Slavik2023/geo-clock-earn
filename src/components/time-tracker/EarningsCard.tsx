
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceStrict } from "date-fns";
import { useState, useEffect } from "react";

interface EarningsCardProps {
  hourlyRate: number;
  overtimeRate?: number;
  startTime?: Date | null;
  isActive?: boolean;
  overtimeThresholdHours?: number;
  totalBreakTime?: number; // in minutes
}

export function EarningsCard({ 
  hourlyRate, 
  overtimeRate, 
  startTime, 
  isActive = false,
  overtimeThresholdHours = 8,
  totalBreakTime = 0
}: EarningsCardProps) {
  const [earnings, setEarnings] = useState({ total: 0, regular: 0, overtime: 0 });
  const [duration, setDuration] = useState({ hours: 0, formatted: "0h 0m", net: "0h 0m" });
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [regularHours, setRegularHours] = useState(0);
  
  // Update calculations every second when timer is active
  useEffect(() => {
    if (!isActive) {
      setEarnings({ total: 0, regular: 0, overtime: 0 });
      setDuration({ hours: 0, formatted: "0h 0m", net: "0h 0m" });
      return;
    }
    
    // If active but no startTime (should never happen), use current time as fallback
    const effectiveStartTime = startTime || new Date();
    
    const calculateEarnings = () => {
      const now = new Date();
      const grossDurationMs = now.getTime() - effectiveStartTime.getTime();
      
      // Subtract break time
      const breakTimeMs = totalBreakTime * 60 * 1000;
      const netDurationMs = Math.max(grossDurationMs - breakTimeMs, 0); // Ensure non-negative
      
      const durationHours = netDurationMs / (1000 * 60 * 60);
      
      let regularHrs = durationHours;
      let overtimeHrs = 0;
      
      // Calculate overtime if applicable
      if (overtimeRate && durationHours > overtimeThresholdHours) {
        regularHrs = overtimeThresholdHours;
        overtimeHrs = durationHours - overtimeThresholdHours;
      }
      
      const regularEarnings = regularHrs * hourlyRate;
      const overtimeEarnings = overtimeHrs * (overtimeRate || hourlyRate * 1.5);
      
      setRegularHours(regularHrs);
      setOvertimeHours(overtimeHrs);
      setEarnings({
        regular: regularEarnings,
        overtime: overtimeEarnings,
        total: regularEarnings + overtimeEarnings
      });
      
      // Format as hours and minutes
      const grossFormatted = formatDistanceStrict(now, effectiveStartTime, { addSuffix: false });
      
      // Calculate net time (gross time minus breaks)
      const netTime = new Date(now.getTime() - breakTimeMs);
      const netTimeStart = new Date(effectiveStartTime.getTime());
      const netFormatted = formatDistanceStrict(netTime, netTimeStart, { addSuffix: false });
      
      setDuration({
        hours: durationHours,
        formatted: grossFormatted,
        net: netFormatted
      });
    };
    
    calculateEarnings(); // Initial calculation
    
    const timer = setInterval(calculateEarnings, 1000);
    return () => clearInterval(timer);
  }, [isActive, startTime, hourlyRate, overtimeRate, overtimeThresholdHours, totalBreakTime]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Current Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="text-3xl font-bold">
            ${earnings.total.toFixed(2)}
          </div>
          
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hourly Rate:</span>
              <span>${hourlyRate.toFixed(2)}/hr</span>
            </div>
            
            {overtimeRate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overtime Rate:</span>
                <span>${overtimeRate.toFixed(2)}/hr</span>
              </div>
            )}
            
            {isActive && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gross Time:</span>
                  <span>{duration.formatted}</span>
                </div>
                {totalBreakTime > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Break Time:</span>
                    <span>{totalBreakTime} min</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Net Work Time:</span>
                  <span>{duration.net}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start Time:</span>
                  <span>
                    {startTime ? startTime.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : '--:--'}
                  </span>
                </div>
              </>
            )}
            
            {/* Earnings breakdown section */}
            {isActive && duration.hours > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-sm font-medium mb-1">Earnings Breakdown:</div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Regular ({regularHours.toFixed(2)} hrs):</span>
                  <span>${earnings.regular.toFixed(2)}</span>
                </div>
                
                {overtimeHours > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overtime ({overtimeHours.toFixed(2)} hrs):</span>
                    <span className="text-orange-500">${earnings.overtime.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
